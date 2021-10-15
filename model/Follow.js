const { ObjectId } = require('mongodb');
const User = require('./User');

const usersCollection = require('../db').db('complexapp').collection('cusers');
const followCollection = require('../db').db('complexapp').collection('follows');
let Follow = function (followUsername, authorId) {
    this.followUsername = followUsername;
    this.authorId = authorId;
    this.errors = [];
}

Follow.prototype.cleanup = function () {
    if (typeof (this.followUsername) !== 'string')
        this.followUsername = '';
}
//followed username must exist in db
Follow.prototype.validate = async function (action) {
    //checking whether the followed account exists
    let followedAccount = await usersCollection.findOne({ username: this.followUsername });
    if (followedAccount._id === this.authorId) {
        this.errors.push('you cannot follow yourself')
        return
    }
    if (followedAccount) {
        this.followedId = followedAccount._id;
    } else {
        if (action === 'create') {
            this.errors.push('you cannot follow a user that does not exist');
        }
        else
            this.errors.push('you cannot unfollow a user that does not exist');

        return
    }
    //checking whether the whether the person is already following the user to stop double entries
    let doesFollowAlreadyExist = await followCollection.findOne({ followedId: this.followedId, authorId: new ObjectId(this.authorId) })
    if (action === 'create') {
        if (doesFollowAlreadyExist) {
            this.errors.push('you are already following this user')
        }
    }
    if (action === 'delete') {
        if (!doesFollowAlreadyExist) {
            this.errors.push('you cannot stop following someone you do not already follow')
        }
    }
}
//function to start following
Follow.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanup();
        //for validating illegal follow related actions
        await this.validate('create');
        if (!this.errors.length) {
            try {
                //inserting new follow document into the database
                await followCollection.insertOne({ followedId: this.followedId, authorId: new ObjectId(this.authorId) });
                resolve();
            } catch (err) {
                reject(['internal error']);
            }
        } else {
            reject(this.errors);
        }
    })
}

Follow.isVisistorFollowing = async function (followedId, visitorId) {
    let followDoc = await followCollection.findOne({ followedId: followedId, authorId: new ObjectId(visitorId) });
    return (followDoc) ? true : false;
}
//function to delete following
Follow.prototype.delete = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanup();
        await this.validate('delete');
        if (!this.errors.length) {
            try {
                //removing follow entry in db
                await followCollection.deleteOne({ followedId: this.followedId, authorId: new ObjectId(this.authorId) });
                resolve();
            } catch (err) {
                reject(['internal error']);
            }
        } else {
            reject(this.errors);
        }
    })
}

//finding follownums
Follow.getFollowMetrics = async function (id) {
    let followednum = (await followCollection.find({ 'followedId': new ObjectId(id) }).toArray()).length
    let followingnum = (await followCollection.find({ 'authorId': new ObjectId(id) }).toArray()).length
    return {
        followednum: followednum,
        followingnum: followingnum
    }
}
//common aggregate function for following and followers
function commonFollowAggFun(who, whom, id) {
    return new Promise(async (resolve, reject) => {
        try {

            let list = await followCollection.aggregate([
                {
                    '$match': {
                        [who]: new ObjectId(id)
                    }
                }, {
                    '$lookup': {
                        'from': 'cusers',
                        'localField': whom,
                        'foreignField': '_id',
                        'as': 'usernamefollowers'
                    }
                }, {
                    '$project': {
                        'username': {
                            '$arrayElemAt': [
                                '$usernamefollowers.username', 0
                            ]
                        },
                        'email': {
                            '$arrayElemAt': [
                                '$usernamefollowers.email', 0
                            ]
                        },
                        'userid': {
                            '$arrayElemAt': [
                                '$usernamefollowers._id', 0
                            ]
                        }
                    }
                }
            ]).toArray();
            list = list.map(function (item) {
                let user = new User(item, true)
                return {
                    username: item.username,
                    avatar: user.avatar,
                    userid: item.userid
                }
            })
            resolve(list);
        } catch (error) {
            reject(error)
        }
    })
}
//getting followng
Follow.getFollowingById = async function (id) {
    return new Promise((resolve, reject) => {
        commonFollowAggFun('authorId', 'followedId', id).then((val) => {
            resolve(val)
        }).catch((err) => {
            reject(err)
        })
    })
}
//getting followers
Follow.getFollowersById = async function (id) {
    return new Promise((resolve, reject) => {
        commonFollowAggFun('followedId', 'authorId', id).then((val) => {
            resolve(val)
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports = Follow;