const postsCollection = require('../db').db('complexapp').collection('posts');
const likesCollection = require('../db').db('complexapp').collection('likes');
const { ObjectId } = require('mongodb');
const User = require('./User');
//for sanitizing html
const sanitizehtml = require('sanitize-html');
const Follow = require('./Follow');
let Post = function (data, _id, requestedPostId) {
    //contains body and title
    this.data = data;
    this.errors = [];
    //for marking each post
    this._id = _id;
    this.requestedPostId = requestedPostId;
};
Post.prototype.cleanUp = function () {
    if (typeof (this.data.title) != 'string') {
        this.data.title = '';
    }
    if (typeof (this.data.body) != 'string') {
        this.data.body = '';
    }
    this.data = {
        body: sanitizehtml(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
        title: sanitizehtml(this.data.title.trim(), { allowedTags: [], allowedAttributes: {} }),
        createdDate: new Date(),
        author: new ObjectId(this._id),
    };
};
Post.prototype.validate = function () {
    if (this.data.title == '') {
        this.errors.push('the title cannot be empty.');
    }
    if (this.data.body == '') {
        this.errors.push('you must provide post content.');
    }
};
Post.prototype.create = async function () {
    this.cleanUp();
    this.validate();
    try {
        if (!this.errors.length) {
            await postsCollection.insertOne(this.data);
        } else {
            //this is temperory
            throw new Error(this.errors);
        }
    } catch (e) {
        console.log(e);
        throw new Error('sorry try again later');
    }
};
//preparing a common aggrigate function for single post screen and profile screen
Post.commonAggrigate = async function (uniqArrayOps, visitorId, finalops = []) {
    //so we need username for displaying author of a post
    //but that is stored in users collection
    //Aggregation operations process data records and return computed results. Aggregation operations group values from multiple documents together, and can perform a variety of operations on the grouped data to return a single result.
    //it takes an array of operations
    //clean up author property
    //return await postsCollection.findOne({ _id: new ObjectId(postid) });
    //this is a common function similar thing applies for getting array of posts

    const concatinatedOps = uniqArrayOps.concat([
        {
            //look in users collection for document with matching field as author
            $lookup: {
                from: 'cusers',
                localField: 'author',
                foreignField: '_id',
                as: 'authorDocument'
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'postId',
                as: 'likestats'
            }
        },
        // to project the required data
        {
            $project: {
                _id: 1,
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {
                    $arrayElemAt: ["$authorDocument", 0]
                },
                likeCount: {
                    $size: "$likestats"
                },
                hasliked: {
                    '$filter': {
                        'input': '$likestats',
                        'cond': {
                            '$eq': [
                                '$$this.authorId', new ObjectId(visitorId)
                            ]
                        }
                    }
                }
            }
        }
    ]).concat(finalops);
    let posts = await postsCollection.aggregate(concatinatedOps).toArray();
    posts = posts.map(function (post) {
        post.isVisitorOwner = post.authorId.equals(visitorId);
        post.authorId = post.authorId;
        post.hasliked = post.hasliked.length > 0;
        post.author = {
            username: post.author.username,
            avatar: new User(post.author, true).avatar
        };
        return post;
    });
    return posts;
};
Post.findSingleById = function (postid, visitorId) {
    //finding the post by id
    if (typeof (postid) == 'string' && ObjectId.isValid(postid)) {
        return this.commonAggrigate([{
            $match: {
                _id: new ObjectId(postid),
            }
        }], visitorId);
    } else
        throw new Error('not a valid id');
};
//pulling in posts for single profile screen
Post.findByAuthorId = function (authorId) {
    return this.commonAggrigate([
        {
            $match: {
                author: authorId
            }
        },
        { $sort: { createdDate: -1 } }
    ]);
};
//actually updating post details called from update
Post.prototype.actuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp();
        this.validate();
        if (!this.errors.length) {
            await
                postsCollection.findOneAndUpdate({ _id: new ObjectId(this.requestedPostId) }, { $set: { title: this.data.title, body: this.data.body } });
            resolve('success');
        } else {
            resolve('failure');
        }
    });
};
//updating the post
Post.prototype.update = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this._id);
            if (post[0].isVisitorOwner) {
                //actually update db
                let status = await this.actuallyUpdate();
                resolve(status);
            }
            this.errors.push('you do not have permission to edit this post');
            reject('failure');
        } catch (error) {
            reject();
        }
    });
};
//for deleting a post
Post.delete = function (postid, visitorid) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postid, visitorid);
            if (post.length) {
                if (post[0].isVisitorOwner) {
                    postsCollection.deleteOne({ _id: new ObjectId(postid) });
                    resolve();
                } else {
                    reject();
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

Post.search = function (searchTerm) {
    return new Promise(async (resolve, reject) => {
        if (typeof (searchTerm) == 'string') {
            try {
                let posts = await Post.commonAggrigate([
                    {
                        '$match': {
                            '$text': {
                                '$search': searchTerm
                            }
                        }
                    }
                ], undefined, [{
                    $sort: { score: { $meta: 'textScore' } },
                }
                ]);
                resolve(posts);

            } catch (error) {
                reject(error);
            }
        } else {
            reject();
        }

    });
};


//getting post numbers
Post.getNum = async function (id) {
    return (await postsCollection.find({ author: new ObjectId(id) }).toArray()).length;
};

//getting posts for dashboard
Post.getFollowingPosts = function (id) {
    return new Promise((resolve, reject) => {
        Follow.getFollowingById(id).then(async (followingarr) => {
            const followingarrid = followingarr.map((arr) => {
                return arr.userid;
            });
            const postsArr = await Post.commonAggrigate([{ $match: { author: { $in: followingarrid } } }], null, [{ $sort: { createdDate: -1 } }]);
            resolve(postsArr);
        });
    });
};
//liking a post
Post.like = async function (postId, like, authorId) {
    if (like) {
        await likesCollection.insertOne({
            authorId: new ObjectId(authorId),
            postId: new ObjectId(postId)
        });
    } else {
        await likesCollection.deleteOne({
            authorId: new ObjectId(authorId),
            postId: new ObjectId(postId)
        });
    }
};
module.exports = Post;