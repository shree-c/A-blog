// pulling up db connection for mongo store
const dotenv = require('dotenv');
dotenv.config();
const client = require('./db');
// express server
const express = require('express');
// express router
const router = require('./router');
//for sessions
const session = require('express-session');
//for storing session data in database
const mongoStore = require('connect-mongo');
//pulling in markdown package
const marked = require('marked');
//pulling in sanitize html
const sanitizehtml = require('sanitize-html');
//pulling in flash package
const flash = require('connect-flash');
//creating express app
const app = express();
//for csrf protection
const csrf = require('csurf');

//session config
const sessionOpts = session({
    secret: 'some secret',
    resave: false,
    //storing session info in database
    store: mongoStore.create({
        client: client,
        dbName: 'complexapp',
    }),
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
});
//using session options
app.use(sessionOpts);
//using flash middleware
app.use(flash());
// for files accessible via their filenames to anybody
app.use(express.static('public'));
// setting up template engine
app.set('views', 'views');
app.set('view engine', 'ejs');
// setting up for parsing posted data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(csrf());
// setting up a local object for every ejsfile to access
app.use((req, res, next) => {
    //make markdown content available within templates
    console.log(req.url);
    res.locals.filterUserHtml = function (content) {
        return sanitizehtml(marked(content), { allowedTags: ['p', 'br', 'ul', 'li', 'strong', 'ol', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {} });
    };
    //make all error and success flash messages available from all templates
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    res.locals.appname = process.env.APP_NAME || 'application_name';
    res.locals.csrfToken = req.csrfToken();
    //making new variable named visitor id to check whether he is logged in or he is guest
    req.visitorId = req.session.user ? req.session.user._id : 0;
    //making sessions object available globally on ejs template
    res.locals.user = req.session.user;
    next();
});
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        req.flash('errors', 'csrf detected');
        req.session.save(() => res.redirect('/'));
    } else {
        res.render('404');
    }
});
app.use(router);
//setup for websockets
const server = require('http').createServer(app);
//bringing in socketio
const io = require('socket.io')(server);
io.use(function (socket, next) {
    sessionOpts(socket.request, socket.request.res, next);
});
io.on('connection', function (socket) {
    let user = socket.request.session.user;
    if (user) {
        socket.emit('welcome', {
            username: user.username,
            avatar: user.avatar,
        });
        socket.on('chat-message-from-browser', function (data) {
            //broadcasting message to other connected users this doesn't include the one who sent the message
            socket.broadcast.emit('chat-message-from-server', {
                message: sanitizehtml(data.message, {
                    allowedTags: [],
                    allowedAttributes: {}
                }),
                username: user.username,
                avatar: user.avatar
            });
        });
    }
});
//we are exporting app so that to start listining after we are connected to database
module.exports = server;