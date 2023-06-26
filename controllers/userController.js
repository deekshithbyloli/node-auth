const User = require('../model/user');

// ********************************* Render Profile Page ****************************************************************

module.exports.render_profile_page = async function(req, res) {
    try{
        console.log('User Controller: At ASYNC ');

        let user = await User.findById(req.params.id);

        return res.render('profile', {user: user});
    }catch(err) {
        console.log('User Controller: Err At ASYNC ', err);
    }
}
