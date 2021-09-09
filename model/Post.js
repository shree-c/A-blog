const postsCollection = require('../db').db('complexapp').collection('posts');
const { ObjectId } = require('mongodb');
let Post = function (data, userid) {
    this.data = data;
    this.errors = [];
    this.userid = userid;
};
Post.prototype.cleanUp = function () {
    if (typeof(this.data.title) != 'string') {
        this.data.title = '';
    }
    if (typeof(this.data.body) != 'string') {
        this.data.body = '';
    }
    this.data = {
        body : this.data.body.trim(),
        title: this.data.title.trim(), 
        createdDate: new Date(),
        author: new ObjectId(this.data.userid),
    };
};
Post.prototype.validate = function () {
    if(this.data.title == '') {
        this.errors.push('the title cannot be empty.');
    }
    if (this.data.body == '') {
        this.errors.push('you must provide post content.');
    }
};
Post.prototype.create = async function() {
    this.cleanUp();
    this.validate();
    try {
        if (!this.errors.length) {
            await postsCollection.insertOne(this.data);
        } else {
            //this is temperory
            throw new Error(this.errors);
        }
    } catch(e) {
        console.log(e);
        throw new Error('sorry try again later');
    }
};
module.exports = Post;