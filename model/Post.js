const postsCollection = require('../db').db('complexapp').collection('posts');
const { ObjectId } = require('mongodb');
const User = require('./User');
let Post = function (data, _id) {
    //contains body and title
    this.data = data;
    this.errors = [];
    //for marking each post
    this._id = _id;
};
Post.prototype.cleanUp = function () {
    if (typeof (this.data.title) != 'string') {
        this.data.title = '';
    }
    if (typeof (this.data.body) != 'string') {
        this.data.body = '';
    }
    this.data = {
        body: this.data.body.trim(),
        title: this.data.title.trim(),
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
Post.findSingleById = async function (postid) {
    //finding the post by id
    if (typeof (postid) == 'string' && ObjectId.isValid(postid)) {
        //so we need username for displaying author of a post
        //but that is stored in users collection
        //Aggregation operations process data records and return computed results. Aggregation operations group values from multiple documents together, and can perform a variety of operations on the grouped data to return a single result.
        //it takes an array of operations
        let posts = await postsCollection.aggregate([
            {
                $match: {
                    _id: new ObjectId(postid),
                }
            },
            {
                //look in users collection for document with matching field as author
                $lookup: {
                    from: 'cusers',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDocument'
                }
            },
            // to project the required data
            {
                $project: {
                    _id: 0,
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    author: {
                        $arrayElemAt : ["$authorDocument", 0]
                    }
                }
            }
        ]).toArray();
        //clean up author property
        posts = posts.map(function (post) {
            post.author = {
                username : post.author.username,
                avatar : new User(post.author, true).avatar
            }
            return post;
        })
        return posts;
        //return await postsCollection.findOne({ _id: new ObjectId(postid) });
    }
}


module.exports = Post;