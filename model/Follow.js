const { ObjectId } = require('mongodb');

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
    if (followedAccount) {
        this.followedId = followedAccount._id;
    } else {
        if (action === 'create')
            this.errors.push('you cannot follow a user that does not exist');
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

module.exports = Follow;