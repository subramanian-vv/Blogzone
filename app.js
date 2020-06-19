const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI; 

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(function() {
        console.log('MongoDB connected..')
    })
    .catch(function(err) {
        console.log(err);
    });

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Body Parser
app.use(express.urlencoded({ extended: false }));

//Express session middleware
app.use(session({
    secret: 'secret',
    resave: true, 
    saveUninitialized: true
}));

//Passport middleware (TIP: Always put it between express and flash middleware)
app.use(passport.initialize());
app.use(passport.session());

//Flash middleware
app.use(flash());

//Global variables
app.use(function (req, res, next) {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg'); 
   res.locals.error = req.flash('error'); 
   next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/dashboard', require('./routes/users'));

//Listening on localhost:3000
app.listen(3000, function() {
    console.log("Listening on port 3000");
});
