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
exports.viewSingle = async function (req, res) {
    try {
        const postObject = await Post.findSingleById(req.params.id);
        //we get array as a result of aggregrate operation
        console.log(postObject[0]);
        if (postObject.length)
            res.render('single-post-screen', {post: postObject[0]});
        else
            res.render('404');
    } catch(e) {
        //we are rendering 404 for every error
        //we can put please try again later for db errors
        res.render('404');
    }
};
