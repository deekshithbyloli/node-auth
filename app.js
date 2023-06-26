const express = require('express'); // provides web development environment
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // creating partials and layout for FE
const nocache = require("nocache"); // restrict browser to go back after clicking on login & logout, must -revalidate
const flash = require('connect-flash');
const connectFlashMiddleware = require('./configs/connectFlashMiddleware');

// middleware: provide functinality to write css code in sass form
const sassMiddleware = require('node-sass-middleware');
const db = require('./configs/mongoose'); // get database instance

// used for session cookie and authentication passport
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./configs/passport-local-strategy');
const googlePassport = require('./configs/passport-google-oauth');
const MongoStore = require('connect-mongo');

const cookieParser = require('cookie-parser');

const app = express();
const port = 8080;

app.use(express.urlencoded());
app.use(cookieParser()); // call cookie parser

// load scss in project
app.use(sassMiddleware({
    src: path.join(__dirname, './assets', 'scss'),
    dest: path.join(__dirname, './assets', 'css'),
    debug: true,
    outputStyle: 'expanded',
    prefix: '/css'
}));

app.use(nocache());


//use express layout
app.use(expressLayouts);

// extract styles and scripts from sub-pages into parent page
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.use(express.static(path.join(__dirname, './assets'))); // get all style, script, img from asset folder

// setup the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// set and use passport after views
app.use(session({
    name: 'node Auth',
    secret: 'randomtext',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/node_auth',
        autoRemove: 'disabled'
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser); // set current user as a locals

app.use(flash());
app.use(connectFlashMiddleware.setFlash);


// call parent router
app.use('/', require('./router')); // this should be 2nd last statement in the main.app.js

// list this app to port: 8080
app.listen(port, function(err) {
    if(err) {
        console.log('Err at loding application');
    }

    console.log(`Server is running on port: ${port}`);
});
