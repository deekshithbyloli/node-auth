
module.exports.key_values = {

    // for Node mailer
    nodemailer_service: "gmail",
    nodemailer_host: "smtp.gmail.com",
    nodemailer_port: 587,
    nodemailer_user: "", // add Email Id used for sending mail to other user
    nodemailer_pass: "", // add password for above user ID (create password using app password from google services)
    
    // for Mongoose DB
    mongoose_db: "mongodb://localhost/node_auth", // mongoose DB path
    
    // for Re-Captcha
    re_captcha_secret_key : "6Lcl52kiAAAAAOk2nJ6b5ZUvH8ulUcyHu9aQ69AL", // for Google captcha
    
    // for google authentication
    g_client_id: "97206409428-fj5m6sh8bb1na4ikji27eblrarqfsjg9.apps.googleusercontent.com", // google signIn client Id
    g_client_secret : "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", // google sign In/UP client secret
    g_callback_url : "http://localhost:8080/auth/google/callback" // google Sign In/Up Callback Url
};

