const router = require('express').Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
//user related routes
router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen);
//storing posts in db
router.post('/create-post', userController.mustBeLoggedIn, postController.create);
//viewing individual post
router.get('/post/:id', postController.viewSingle);
module.exports = router;
