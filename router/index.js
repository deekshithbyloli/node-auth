const express = require('express'); // get instance of express 
const router = express.Router(); // router : handles get and post request
const passport = require('passport'); // get instance of passprt for authentication

// Home index
router.use('/home', passport.checkAuthentication, require('./home'));

// Users Index : profile
router.use('/users', passport.checkAuthentication, require('./user'));

// Auth Index : authentication
router.use('/auth', require('./auth'));

// export current module
module.exports = router;