//bringing in the database client for CRUD operations
const userCollection = require('../db').collection('cusers');
//we are using validator npm package to validate user input data
const validator = require('validator')
//what defines a user?
const User = function (data) {
    this.data = data;
    // for managing errors
    this.errors = [];
}

//function to make sure the user has submitted only strings
User.prototype.cleanUp = function () {
    if (typeof(this.data.username) != 'string')
        this.data.username = '';
    if (typeof(this.data.email) != 'string')
        this.data.email = '';
    if (typeof(this.data.password) != 'string')
        this.data.password = '';
    //get rid of any other properties other than the above three
    this.data = {
        username : this.data.username.trim().toLowerCase(),
        password : this.data.password,
        email : this.data.email.trim().toLowerCase()
    }
}

//function to validate user data
User.prototype.validate = function () {
    if (!this.data.username)
        this.errors.push('empty username');
    if (this.data.username != '' && !validator.isAlphanumeric(this.data.username))
        this.errors.push('the username should only contain alphanumeric characters');
    if (!validator.isEmail(this.data.email))
        this.errors.push('not a valid email address');
    if (!this.data.password)
        this.errors.push('empty password');
    if (!this.data.email)
        this.errors.push('empty email');
    if (this.data.password.length < 6 || this.data.password.length > 30)
        this.errors.push('the password length should lie between 6 to 30!');
    if (this.data.username.length < 3 || this.data.password.length > 20)
        this.errors.push('the username length should lie between 3 to 20!');
}

User.prototype.register = function () {
    //making sure that the user doesn't send anything other than a string
    this.cleanUp()
    //validating user data
    this.validate();
    // adding data to database if there are no validation errors
    if (!this.errors.length)
        userCollection.insertOne(this.data);
}

module.exports = User
