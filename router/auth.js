const express = require('express'); // get instance of express 
const router = express.Router(); // router : handles get and post request
const passport = require('passport'); // get instance of passprt for authentication

/* ************************************************************************************
    authController : All methods related to Authentication and password update
************************************************************************************ */
const authController = require('../controllers/authController');


/* ************************************************************************************
    Routers for Authentication: manual
        - Login
        - Signup
        - Logout
************************************************************************************ */
router.post('/create_session', passport.authenticate('local',{failureRedirect: '/auth/login_page'}), authController.create_session_passport_Auth);
router.get('/login_page', authController.render_login_page);
router.get('/signup_page', authController.render_signup_page);
router.post('/create_new', authController.create_new_user);
router.get('/sign-out', authController.distroy_session);
// router.post('/create_session', userController.create_session_mannual_Auth);


/* ************************************************************************************
    Routers for Authentication: Google
        - SignIn / SignUp
        - Fetch data : Profile & Email
************************************************************************************ */
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/auth/login_page'}), authController.create_session_passport_Auth)


/* ************************************************************************************
    Router for change password : Forgot password / Without login
        - Render ask email
        - Get a link on email
        - verify link
        - update password
************************************************************************************ */
router.get('/reset_pass_page', authController.render_reset_pass_page);
router.post('/generate_accessToken', authController.generate_access_token);
router.get('/verify_key/:id', authController.verifyAccessToken);
router.post('/update_password', authController.update_password);


/* ************************************************************************************
    Router for update password : With login
        - Reverify User : Ask password
        - Update password
************************************************************************************ */
router.get('/render_pass', passport.checkAuthentication, authController.render_password_page);
router.post('/verify_user', authController.verify_user);

// export current module
module.exports = router;