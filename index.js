const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const staticPagesRoutes = require('./routes/static');
const connectDB = require('./db')
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 5000;
connectDB();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
    cookie: {}
}));

// Middleware to handle session messages
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

// initialize passport
app.use(passport.initialize());

// passport session
app.use(passport.session());

// set template engine
app.set('view engine', 'ejs');

//define static folder
app.use(express.static('public'));

app.use('', staticPagesRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
