//pulling Post model
const Post = require('../model/Post');
//we are going to export post related functions that are going to be used in router

exports.viewCreateScreen = function(req, res) {
    res.render('create-post');
};

//creating posts and storing it in db
exports.create = async function (req, res) {
    let post = new Post(req.body, req.session.user._id);
    try {
        await post.create();
        res.send('new post created');
    } catch(e) {
        res.send(e);
    }
};
//viewing single post

exports.viewSingle = function (req, res) {
    res.render('single-post-screen');
};