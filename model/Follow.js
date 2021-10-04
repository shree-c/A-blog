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
Follow.prototype.validate = async function () {
    let followedAccount = await usersCollection.findOne({ username: this.followUsername });
    if (followedAccount) {
        this.followedId = followedAccount._id;
    } else {
        this.errors.push('you cannot follow a user that does not exist');
    }
}
Follow.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanup();
        await this.validate();
        if (!this.errors.length) {
            try {
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

module.exports = Follow;