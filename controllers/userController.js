// these functions are going to be used in router
const User = require('../model/User')
//going to load the home page for a user
exports.home = function (req, res) {
    //rendering the ejs file
    res.render('home-guest');
}
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

exports.login = async function (req, res) {
    let user = new User(req.body);
    user.login().then((value) => {
        res.send(value);
    }).catch((e) => {
        res.send(e);
    })
}

exports.logout = function () {

}
