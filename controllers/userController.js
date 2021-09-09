// these functions are going to be used in router
const User = require('../model/User');
//going to load the home page for a user
exports.home = function (req, res) {
    //if there is session data we render dashboard else login page
    if (req.session.user) {
        //pulling in username from session data
        res.render('home-dashboard');
    } else {
        //rendering the ejs file and display flash messages if there are any
        res.render('home-guest', { errors: req.flash('errors'), regErrors: req.flash('regErrors') });
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
            _id: user.data.id
        };
        //since we are creating the new session it is an async action
        req.session.save(() => {
            res.redirect('/');
        });
    }
};
//for handeling login
exports.login = async function (req, res) {
    let user = new User(req.body);
    try {
        await user.login();
        //storing session data on request object
        req.session.user = {
            username: req.body.username,
            avatar : user.avatar,
            _id : user.data._id,
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
        req.session.save(()=>{
            res.redirect('/');
        });
    }
}; 