// these functions are going to be used in router
const User = require('../model/User')
//going to load the home page for a user
exports.home = function (req, res) {
    //if there is session data we render dashboard else login page
    if (req.session.user) {
        //puling in username from session data
        res.render('home-dashboard', { username: req.session.user.username });
    } else {
        //rendering the ejs file and display flash messages if there are any
        res.render('home-guest', {errors: req.flash('errors')});
    }
}
//for handeling new user registeration
exports.register = function (req, res) {
    //we are sending the entered data to User model for user objec creation
    const user = new User(req.body);
    //register function calls validate function on the prototype of User to validate user data
    user.register();
    if (user.errors.length)
        res.send(`${user.errors}`);
    else
        res.send('thanks for registering')
}
//for handeling login
exports.login = async function (req, res) {
    let user = new User(req.body);
    user.login().then((value) => {
        //storing session data on request object
        req.session.user = {
            username: req.body.username,
            favcolor: "red"
        }
        //since we are creating the new session it is an async action
        req.session.save(() => {
            res.redirect('/');
        });
    }).catch((e) => {
        //if there are any errors we want to show error messages on that page only so we are using flash package
        //flash package makes use of sessions
        req.flash('errors', e);
        //because async operation
        req.session.save(() => {
            res.redirect('/');
        });
    })
}
//for handeling logout
exports.logout = function (req, res) {
    //destroying session cookie
    req.session.destroy(() => {
        //we are doing this because the home page will be different depending of we have a sesion or not
        res.redirect('/');
    });
}
