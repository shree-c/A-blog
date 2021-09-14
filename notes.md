## I am going to write notes related to the development of this app here.
### Table of contents
- [database](#database)
- [usermodelling](#user-model)
- [dotenv](#environment-variables)
- [sessions](#sessions)
- [flash messages](#flash)

#### database
1. we created a seperate database file and made at as a main file which starts first and imported express app object after connecting to database.
2. we export database object from db.js file.


#### user model
1. we used **bcryptjs** to hash passwords


#### environment variables
1. we made a file called .env and we store key value data in it.
2. we can import those sotred key values in to whichever file we need using a package called dotenv.
3. we need to call dotenv.config

#### sessions
1. we want to remember that the user has logged in once and show him his dashboard instead of login page when he opens our app
2. but http requests are stateless, so, sessions come into play here.
3. we are using express-sessions package
4. we would leverage session at the login function
5. each time a person logins unique session data is sent and it is stored on the server
6. the server in turn stores cookie in the browser and the cookie has the age
7. the browser sends cookie with the each request made to the base url
8. based on the cookie sent the server responds

#### flash

1. It is a way of informing users of different things like incorrect password or wrong credentials etc. we are using **connect flash** package to do that.
2. The flash package just adds data on the session object. So again here we need to access database.

#### restricting access to routes
* we used a function to check whether a user has the logged in using req.session.user
* if not we flashed approprite messages and redirected user to home
* we use this function on routes where we want to restrict

#### creating posts
* we have two files namely post-controller and Post related to posts.
* a person who has an account can create posts
* each post by a person is marked with the id of the creator