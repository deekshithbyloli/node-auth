/*
    This Config is written by Aayush Kumar Gupta
    Flash is being used for flash notification
    This middleware is being used between Connect_flash -> our project via NOTY
*/

module.exports.setFlash = function(req, res, next){
    res.locals.flash = {
        'success': req.flash('success'),
        'error': req.flash('error')
    }

    next();
}