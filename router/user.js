const express = require('express'); // get instance of express 
const router = express.Router(); // router : handles get and post request
const passport = require('passport'); // get instance of passprt for authentication

/* ************************************************************************************
    UserController : All methods related to User/Profile page
************************************************************************************ */
const userController = require('../controllers/userController');

// show profile page
router.get('/profile/:id', userController.render_profile_page);

// export current module
module.exports = router;