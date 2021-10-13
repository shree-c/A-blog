//--------> these functions are going to be used in router
//used to load single profile screen
const User = require('../model/User');
//going to load the home page for a user
const Post = require('../model/Post');
const Follow = require('../model/Follow');
exports.home = function (req, res) {
    //if there is session data we render dashboard else login page
    if (req.session.user) {
        //pulling in username from session data
        res.render('home-dashboard');
    } else {
        //rendering the ejs file and display flash messages if there are any
        res.render('home-guest', { regErrors: req.flash('regErrors') });
    }
};
//for handeling new user registeration
exports.register = async function (req, res) {
    //we are sending the entered data to User model for user objec creation
    const user = new User(req.body);
    //register function calls validate function on the prototype of User to validate user data
    await user.register();
    if (user.errors.length) {
        //adding flash messages if there are any errors
        user.errors.forEach((message) => {
            req.flash('regErrors', message);
        });
        req.session.save(() => {
            res.redirect('/');
        });
    }
    else {
        //storing session data on request object
        req.session.user = {
            username: req.body.username,
            avatar: user.avatar,
            _id: user.data._id
        };
        //since we are creating the new session it is an async action
        req.session.save(() => {
            res.redirect('/');
        });
    }
};
//for handeling login
exports.login = async function (req, res) {
    const user = new User(req.body);
    try {
        await user.login();
        //storing session data on request object
        req.session.user = {
            username: req.body.username,
            avatar: user.avatar,
            _id: user.data._id,
        };
        //since we are creating the new session it is an async action
        req.session.save(() => {
            res.redirect('/');
        });
    } catch (e) {
        //if there are any errors we want to show error messages on that page only so we are using flash package
        //flash package makes use of sessions
        req.flash('errors', e.message);
        //because async operation
        req.session.save(() => {
            res.redirect('/');
        });
    }
};
//for handeling logout
exports.logout = function (req, res) {
    //destroying session cookie
    req.session.destroy(() => {
        //we are doing this because the home page will be different depending of we have a sesion or not
        res.redirect('/');
    });
};

//we want to restrict certain routes to the signed in users only
exports.mustBeLoggedIn = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.flash('errors', 'you must be logged in');
        req.session.save(() => {
            res.redirect('/');
        });
    }
};

//userprofile related functions
exports.ifUserExists = function (req, res, next) {
    //finding if a user exists and setting his details on req.profileUser obj
    User.findByUsername(req.params.username).then(function (userDocument) {
        req.profileUser = userDocument;
        next();
    }).catch(function () {
        res.render('404');
    });
}

//checking whether a user is following or unfollowing for showing follow buttons
exports.sharedProfileData = async function (req, res, next) {
    let isFollowing = false;
    if (req.session.user) {
        isFollowing = await Follow.isVisistorFollowing(req.profileUser._id, req.visitorId);
        req.followmetrics = await Follow.getFollowMetrics(req.profileUser._id)
        req.postNums = await Post.getNum(req.profileUser._id)
    }
    req.isFollowing = isFollowing;
    next();
}

exports.profilePostsScreen = async function (req, res) {
    //pulling in all the posts
    try {
        const allposts = await Post.findByAuthorId(req.profileUser._id);
        res.render('profile', {
            posts: allposts,
            profileusername: req.profileUser.username,
            profileavatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            followersnum: req.followmetrics.followednum,
            followingnum: req.followmetrics.followingnum,
            postsnum: req.postNums,
            url: req.url
        })
    } catch (err) {
        console.log(err);
        res.render('404');
    }

}
//followers screen 
exports.profileFollowersScreen = async function (req, res) {
    await Follow.getFollowersById(req.profileUser._id).then((followers) => {
        res.render('profile-followers', {
            profileusername: req.profileUser.username,
            profileavatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            follow: followers,
            followersnum: req.followmetrics.followednum,
            followingnum: req.followmetrics.followingnum,
            postsnum: req.postNums,
            url: req.url
        })
    }).catch((err) => {
        res.render('404')
    });

}
//following screen
exports.profileFollowingScreen = async function (req, res) {
    await Follow.getFollowingById(req.profileUser._id).then((following) => {
        res.render('profile-followers', {
            profileusername: req.profileUser.username,
            profileavatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            follow: following,
            followersnum: req.followmetrics.followednum,
            followingnum: req.followmetrics.followingnum,
            postsnum: req.postNums,
            url: req.url
        })
    }).catch((err) => {
        console.log(err)
        res.render('404')
    });
}