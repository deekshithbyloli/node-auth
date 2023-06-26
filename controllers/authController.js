const User = require('../model/user'); // get User document instance
const UserAT = require('../model/userAccessToken'); // get User with access token instance
const crypto = require('crypto'); // get crypto instance
const passwordMailer = require('../mailers/reset_pass_mailer'); // get nodemailer config
const resetPasswordWorker = require('../worker/reset_pass');
const queue = require('../configs/kue');

const fetch = require('isomorphic-fetch');
const keys = require('../configs/app_keys');



/* *****************************************************************************************************
    these libraries is being used for getting long datatype 
    this long datatype is being used in expiry time for access token link
***************************************************************************************************** */
const mongoose = require('mongoose'); // get mongoose instance
require('mongoose-long')(mongoose); // require mongoose-long
const {Types: {Long}} = mongoose; // get Long datatype for mongodb

/* *****************************************************************************************************
    Render login page on req
***************************************************************************************************** */
module.exports.render_login_page = function(req, res) {
    
    // if user is signed in don't show login page
    if(req.isAuthenticated()) {
        return res.redirect('/home');
    }
    
    return res.render('login');
}

/* *****************************************************************************************************
    render signup page on req
***************************************************************************************************** */
module.exports.render_signup_page = function(req, res) {
    // if user is signed in don't show signup page
    if(req.isAuthenticated()) {
        return res.redirect('/home');
    }

    return res.render('signUp');
}


/* *****************************************************************************************************
    feature signup : create a new user
    ***************************************************************************************************** */
module.exports.create_new_user = async function(req, res) {
    try{
        let user = await User.findOne({email: req.body.email});

        // getting site key from client side
        const response_key = req.body["g-recaptcha-response"];

        // Put secret key here, which we get from google console
        const secret_key = keys.key_values.re_captcha_secret_key;

        // Hitting POST request to the URL, Google will
        // respond with success or error scenario.
        const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

        // Making POST request to verify captcha
        fetch(url, {
            method: "post",
        })
        .then((response) => response.json())
        .then((google_response) => {
            // google_response is the object return by
            // google as a response
            if (google_response.success == true) {
                //   if captcha is verified
                
                if(req.body.password != req.body.confirm_password) {
                    req.flash('error', 'Password does not match');
                    return res.redirect('back');
                }
                
                if(!user) {
        
                    // Create a new user
                    let newUser = new User();
        
                    newUser.name = req.body.name;
                    newUser.email = req.body.email;
                    newUser.setPassword(req.body.password);
        
                    //  save this new user
                    newUser.save((err, User) => {
                        
                        if(err) {
                            console.log('error at saving new user ', err);
                            return res.redirect('back'); 
                        }else {
                            req.flash('success', 'New User Created');
                            return res.redirect('/auth/login_page');
                        }
                    });
                }
                else {
                    return res.redirect('back');
                }

            } else {
                // if captcha is not verified
                req.flash('error', 'Please Verify captcha')
                return res.redirect('back');
            }
        });
    }catch(err){
        return res.redirect('back');
    }

}

/* ******************************************************************************************************
    MANUAL AUTHENTICATION

    sign in user - create a session for user

    find the user
    handle user found
    handle mismatching password 
    handle session creation
    handle user is not found 
******************************************************************************************************** */
module.exports.create_session_mannual_Auth = function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
        if(err) {
            console.log('error at finding user in  sign in: ', err);
            return;
        }

        if(user) {
            if(user.password != req.body.password) {
                console.log('Invalid user / password')
                return res.redirect('back');
            }

            res.cookie('user_id', user.id);

            return res.redirect('/users/profile');
        }else {
            console.log('user not found');
            return res.redirect('back');
        }
    });
}

/* *****************************************************************************************************
    feature login : Create a session using passport authentication
***************************************************************************************************** */
module.exports.create_session_passport_Auth = function(req, res) {
    req.flash('success', 'Welcome ');
    return res.redirect('/home');
}


/* *****************************************************************************************************
    feature logout : Logout by destroying session created by passport using express-session
***************************************************************************************************** */
module.exports.distroy_session = function(req, res) {
    // logout function has been given to req by passport 
    req.logout(function(err) {
        if(err) {
            console.log(err || 'Logged out from session');
        }

        req.flash('success', 'See you soon');
        return res.redirect('/auth/login_page'); // redirect user to home
    }); 
}

/* *****************************************************************************************************
    feature Forgot password : Render ask email on req
***************************************************************************************************** */
module.exports.render_reset_pass_page = function(req, res) {
    return res.render('reset_password_page');
}

/* *****************************************************************************************************
    feature forgot password: Generate accesstoken for a user (Unique access token)
***************************************************************************************************** */
module.exports.generate_access_token = async function(req, res) {
    try{
        let current_millies = new Date().getTime(); // current time in miliseconds
        current_millies = current_millies + (1000 * 60 * 5); // after 5 mins

        let user = await User.findOne({email: req.body.email});

        if(user) {
            // create a new accesstoken associated with this.user

            let userWithAT = await UserAT.create({
                user: user,
                expiresAt: Long.fromNumber(current_millies),
                accessToken: crypto.randomBytes(20).toString('hex')
            });

            userWithAT = await userWithAT.populate('user', 'name email');
            
            // add user with access token to mailer worker
            queue.create('NodeAuthPassResetEmail', userWithAT).save();
            console.log('Job Enqueued');


            return res.render('reset_pass_link_sent');
        }

    }catch(err) {
        console.log('AuthController: error at generating access token ', err);
    }
}

/* *****************************************************************************************************
    feature forgot password: Verify accesstoken using mongoDB document
***************************************************************************************************** */
module.exports.verifyAccessToken = async function(req, res) {
    try{
        let current_millies = new Date().getTime();

        let userWithAT = await UserAT.findOne({accessToken: req.params.id});

        // If User WIth access Token is not available
        if(!userWithAT) {
            return res.render('invalid', {message: 'invalid link'});
        }

        // if user's link is expired (5 min life)
        if(userWithAT.expiresAt < current_millies) {
            await UserAT.findOneAndUpdate({accessToken: req.params.id}, {isValid: false});
            return res.render('invalid', {message: 'Timeout: Link Expired'});
        }

        // if user's link is invalid -> clicked after updating password
        if(!userWithAT.isValid) {
            return res.render('invalid', {message: 'Link Expired'});
        }

        // Everything is good: update password
        let user_id = userWithAT.user;
        let user = await User.findById(user_id);
        if(user) {
            return res.render('update_password', {user: user, userWithAT: userWithAT});
        }

        // if something is not caught return invalid user
        return res.render('invalid', {message: 'Invalid user'});

    }catch(err) {
        console.log('AuthController: error at verifying access token ', err);
    }
}

/* *****************************************************************************************************
    feature forgot password: Update  using link send to user (unique link)
***************************************************************************************************** */
module.exports.update_password = async function(req, res) {

    if(req.body.password == req.body.confirm_password) {

        // let user = await User.findOneAndUpdate({email: req.body.email},{password: req.body.password});
        let user = await User.findOne({email: req.body.email});
        user.setPassword(req.body.password);

        user.save((err, User) => {
            if(err){
                console.log('error at updaing password');
                return redirect('back');
            }
        });
        
        if(user) {
            if(req.body.isLogged == 1) await UserAT.findOneAndUpdate({accessToken: req.body.accessToken}, {isValid: false});
            req.flash('success', 'password updated');
            return res.redirect('/home');
        }
    }else {
        return;
    }
}

/* *****************************************************************************************************
    feature Change password : Render ask password page: purpose-> ask password to re-verify user
***************************************************************************************************** */
module.exports.render_password_page = function(req, res) {
    res.render('ask_password');
}

/* *****************************************************************************************************
    feature change password : check if password is correct or not
***************************************************************************************************** */
module.exports.verify_user = function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
        if(err) {
            console.log('error at finding user in verify user: ', err);
            return;
        }

        if(user) {
            if(user.notMatch(req.body.password)) {
                req.flash('error', 'Wrong Password');
                return res.redirect('back');
            }else{
                req.flash('success', 'user verified');
                return res.render('update_password_logged', {user: user});
            }

        }else {
            req.flash('error', 'user not found');
            return res.redirect('back');
        }
    });
}