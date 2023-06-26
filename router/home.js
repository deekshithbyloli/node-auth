const express = require('express'); // get instance of express 
const router = express.Router(); // router : handles get and post request

/* ************************************************************************************
    homeController : All methods related to home page
************************************************************************************ */
const homeController = require('../controllers/homeController');

// render home page
router.get('/', homeController.render_home_page);

// export current module
module.exports = router;