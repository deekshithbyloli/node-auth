//  This startegy is written by Aayush Kumar Gupta

// passport-local authentication , User Input authentication

const passport = require('passport'); // get instance of passport
const LocalStrategy = require('passport-local').Strategy; // local-auth startegy
const User = require('../model/user'); // User schema
const fetch = require('isomorphic-fetch');
const keys = require('./app_keys');


// Authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true
    }, function(req, email, password, done) {

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
                // find the user and establish connection
                User.findOne({email: email}, function(err, user) {
                    if(err) {
                        req.flash('error', 'Internal Server Error')
                        return done(err);
                    }

                    if(!user || user.notMatch(password)) {
                        req.flash('error', 'Invalid user / password')
                        return done(null, false); // there is no error but user is not found -> false
                    }

                    return done(null, user); // there is no error but user is found
                });
            } else {
                // if captcha is not verified
                req.flash('error', 'Please Verify captcha')
                return done(null, false);
            }
        })
        .catch((error) => {
            // Some error while verify captcha
            console.log('error at captcha -> ', error);
            return done(null, false);
        });
    }
));

// serialize user function 
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// deserialize the user
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err) {
            console.log('Error : Passport config : finding user');
            return done(err);
        }

        return done(null, user);
    });
});


// check if the user is authenticated
passport.checkAuthentication = function(req, res, next) {
    // next function(controller action)
    if(req.isAuthenticated()) {
        return next();
    }

    // is user is not signed in
    return res.redirect('/auth/login_page');
}

// If there is a user logged In : Set this user as local user
passport.setAuthenticatedUser = function(req, res, next) {
    if(req.isAuthenticated()) {
        // req.user contains current signed user from the sessio cookie
        res.locals.user = req.user;
    }

    next(); // call Next middleware : Most Imp
}


// export this startegy
module.exports = passport;