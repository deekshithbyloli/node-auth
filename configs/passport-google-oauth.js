//  This startegy is written by Aayush Kumar Gupta


// Passport is used for google Authentication

// get instance of passport
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy; // google strategy
const crypto = require('crypto'); // create a random password using crypto
const User = require('../model/user'); // User schema
const keys = require('./app_keys');

// use google strategy for signing
passport.use(new googleStrategy({
        clientID: keys.key_values.g_client_id,
        clientSecret: keys.key_values.g_client_secret,
        callbackURL: keys.key_values.g_callback_url
    },
    function(accessToken, refreshToken, profile, done){
        User.findOne({email: profile.emails[0].value}).exec(function(err, user){
            if(err) {
                console.log('err : passport google auth config ', err);
                return;
            }

            if(user) {
                // if user is present in DB then logIn Directly
                return done(null, user);
            }else {
                // In Case of User is not present in DB: Register this user in DB and Login
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex')
                }, function(err, user) {
                    if(err) {
                        console.log('err : passport google auth config ', err);
                        return;
                    }

                    return done(null, user);
                });
            }
        });
    }
));

// Export this strategy
module.exports = passport;