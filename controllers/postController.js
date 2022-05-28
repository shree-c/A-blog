//pulling Post model
const Post = require('../model/Post');
//we are going to export post related functions that are going to be used in router

exports.viewCreateScreen = function (req, res) {
    res.render('create-post');
};

//creating posts and storing it in db
exports.create = async function (req, res) {
    let post = new Post(req.body, req.session.user._id);
    try {
        await post.create();
        //redirecting after creating post
        req.flash('success', 'post successfully created');
        req.session.save(function () {
            res.redirect(`post/${post.data._id}`);
        });
    } catch (e) {
        e.forEach(e => req.flash('errors', e));
        req.session.save(function () {
            res.redirect('/create-post');
        });
    }
};

//viewing single post
exports.viewSingle = async function (req, res) {
    try {
        //passing visitorid variable available so to check whether the person is owner of post
        const postObject = await Post.findSingleById(req.params.id, req.visitorId);
        //we get array as a result of aggregrate operation
        if (postObject.length)
            res.render('single-post-screen', { post: postObject[0] });
        else
            res.render('404');
    } catch (e) {
        //we are rendering 404 for every error
        //we can put please try again later for db errors
        console.log(e);
        res.render('404');
    }
};

//editing a post
exports.viewEditScreen = async function (req, res) {
    try {
        const post = await Post.findSingleById(req.params.id);
        //when a non logged in user tries to open edit link
        if (req.session && post) {
            if (req.visitorId == `${post[0].authorId}`)
                res.render('edit-post', { post: post[0] });
            else {
                req.flash('errors', 'you do not have permission to do that action');
                req.session.save(function () {
                    res.redirect('/');
                });
            }
        }
    } catch (error) {
        res.render('404');
    }
};

//updating the post
exports.edit = async function (req, res) {
    //passing relevent info so that it can make comparasions for update function
    let post = new Post(req.body, req.visitorId, req.params.id);
    //permission to edit is determined by session id
    //we create an update function which gives update back
    //it also populates error array
    post.update().then((status) => {
        //when everything is good update the values in database and redirect back to edit screen
        if (status === 'success') {
            req.flash('success', 'Post successfully updated');
            req.session.save(function () {
                res.redirect(`/post/${req.params.id}/edit`);
            });
        } else {
            //else flash errors form error array and redirect back to edit screen
            //user had permissions but there were validation errors
            post.errors.forEach((error) => {
                req.flash('errors', error);
            });
            res.session.save(function () {
                res.redirect(`/post/${req.params.id}/edit`);
            });
        }
    }).catch(() => {
        //when a person who do not have permission to edit try this url
        //I think the control will not even come here
        req.flash('errors', `You don't have permission to edit this post.`);
        req.session.save(function () {
            res.redirect('/');
        });
    });
};

exports.delete = function (req, res) {
    Post.delete(req.params.id, req.visitorId).then(() => {
        req.flash('success', 'post successfully deleted');
        req.session.save(() => {
            res.redirect(`/profile/${req.session.user.username}`);
        });
    }).catch((err) => {
        req.flash('errors', 'you do not have permission to perform that action');
        req.session.save(() => {
            res.redirect('/');
        });
    });
};

exports.search = function (req, res) {
    console.log(req.body.searchTerm);
    Post.search(req.body.searchTerm).then((val) => {
        res.json(val);
    }).catch((err) => {
        console.log(err);
        res.json([]);
    });
};