const mongoose = require('mongoose'); // get mongoose instance
const crypto = require('crypto'); // get crypto instance

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }, 
    hash : String, // encrypted password
    salt : String // unique salt for each user
}, {
    timestamps: true
});

// method for set an encrypted password
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
}

/* ********************************************************************************************************
    Return True : method for not matching user input password and DB encrypted password,
    else :  False
******************************************************************************************************** */
userSchema.methods.notMatch = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    
    return this.hash !== hash;
}

/* ********************************************************************************************************
    ARG 1: model name for ref
    ARG 2: name of schema specified in current script
    ARG 3: name of schema you want in Mongo DB
******************************************************************************************************** */
const User = mongoose.model('User', userSchema, 'user'); 

module.exports = User;