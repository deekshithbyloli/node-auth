/*
    This Config is written by Aayush Kumar Gupta
    This is config file for mongoDB

*/

// get instance of mongoose
const mongoose = require('mongoose');
const keys = require('./app_keys');
// connect to a database
mongoose.connect(keys.key_values.mongoose_db);

// create a connection
const db = mongoose.connection;

// in case of error 
db.on('error', console.error.bind(console, 'Error Connecting to mongo db'));

// if conneciton established
db.once('open', function(){
    console.log('Connected to MongoDB Database :: node_auth');
});


// export db instance
module.exports = db;