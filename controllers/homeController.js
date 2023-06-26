// **************************************** Render home page *********************************************************

module.exports.render_home_page = function(req, res) {
    console.log('Home Controller : Render Home Page');

    return res.render('home', {
        title: "Home page EJS"
    });
}