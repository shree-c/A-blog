//bcrypt for hashing passwords
const bcrypt = require('bcryptjs');
//bringing in the database client for CRUD operations
const userCollection = require('../db').db('complexapp').collection('cusers');
//we are using validator npm package to validate user input data
const validator = require('validator');
//pulling in md5 for gravatar
const md5 = require('md5');
//what defines a user?
//making changes to the constructor function to add second boolean argument for gravatar fetching
const User = function (data, getAvatar = false) {
    this.data = data;
    // for managing errors
    this.errors = [];
    if (getAvatar) {
        this.getAvatar();
    }
};

//function to make sure the user has submitted only strings
User.prototype.cleanUp = function () {
    if (typeof (this.data.username) != 'string')
        this.data.username = '';
    if (typeof (this.data.email) != 'string')
        this.data.email = '';
    if (typeof (this.data.password) != 'string')
        this.data.password = '';
    //get rid of any other properties other than the above three
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        password: this.data.password,
        email: this.data.email.trim().toLowerCase()
    };
};

//function to validate user data
User.prototype.validate = async function () {
    if (!this.data.username)
        this.errors.push('empty username');
    if (this.data.username != '' && this.data.username.length <= 3 || this.data.username.length > 20)
        this.errors.push('the username length should lie between 3 to 20!');
    if (this.data.username != '' && !validator.isAlphanumeric(this.data.username))
        this.errors.push('the username should only contain alphanumeric characters');
    if (this.data.email != '' && !validator.isEmail(this.data.email))
        this.errors.push('not a valid email address');
    if (!this.data.password)
        this.errors.push('empty password');
    if (!this.data.email)
        this.errors.push('empty email');
    if (this.data.password != '' && this.data.password.length <= 3 || this.data.password.length > 20)
        this.errors.push('the password length should lie between 3 to 20!');
    //only if the username is valid we check for whether it already taken
    if (this.data.username.length >= 3 && this.data.username.length <= 20 && validator.isAlphanumeric(this.data.username)) {
        let usernameExists = await userCollection.findOne({ username: this.data.username });
        if (usernameExists) {
            this.errors.push('username already taken');
        }
    }
    //only if the email is valid we check for whether it already taken
    if (validator.isEmail(this.data.email)) {
        let emailExists = await userCollection.findOne({ email: this.data.email });
        if (emailExists) {
            this.errors.push('email already taken');
        }
    }
};
//function for handeling register
User.prototype.register = async function () {
    //making sure that the user doesn't send anything other than a string
    this.cleanUp();
    //validating user data
    await this.validate();
    // adding data to database if there are no validation errors
    if (!this.errors.length) {
        //hashing the password
        const salt = bcrypt.genSaltSync(10);
        this.data.password = bcrypt.hashSync(this.data.password, salt);
        await userCollection.insertOne(this.data);
        this.getAvatar();
    }
};

//function for handeling login
User.prototype.login = async function () {
    //we are querying the database to check for username and password
    //since querying is an async operation we are returning a promise
    this.cleanUp();
    const attemptedUser = await userCollection.findOne({ username: this.data.username });
    if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        this.data = attemptedUser;
        this.getAvatar();
        return;
    }
    else
        throw new Error('incorrect username/password');
};
//working on gravatar--> showing profile photo
User.prototype.getAvatar = function () {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};
//profile related functions
User.findByUsername = function (username) {
    return new Promise(function (resolve, reject) {
        if (typeof (username) !== 'string') {
            reject();
            return;
        }
        userCollection.findOne({ username: username }).then(function (userObject) {
            if (userObject) {
                userObject = new User(userObject, true)
                userObject = {
                    _id: userObject.data._id,
                    username: userObject.data.username,
                    avatar: userObject.avatar
                }
                resolve(userObject);
            }
        }).catch(function () {
            reject();
        })
    })
}

module.exports = User;
