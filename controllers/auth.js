const passport = require('passport');
const user = require('../models/user');

// Create passport local strategy
passport.use(user.createStrategy());

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    user.findById(id)
    .then(user => {
        done(null, user);
    })
});


// register user in db
const register = async (req, res) => {
    try {
        const user = await user.register({username: req.body.username, password: req.body.password}, req.body.password);
        if(user) {
            req.session.message = {
                type: 'success',
                message: 'Account created successfully!.'
            };
            passport.authenticate('local')(req, res, function() {
                res.redirect('/dashboard');
            });
        } else {
            res.redirect('/auth/signup');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/auth/signup');
    }
}

// login user
const loginUser = (req, res) => {
    const userData = new user({
        username: req.body.username,
        password: req.body.password
    });

    req.login(userData, (err) => {
        if(err) {
            console.log(err);
            req.session.message = {
                type: 'danger',
                message: 'An error occurred. Please try again.'
            };
            res.redirect('/auth/signin');
        } else {
            passport.authenticate('local')(req, res, function() {
                req.session.message = {
                    type: 'success',
                    message: 'Welcome back. Logged in successfully!.'
                };
                res.redirect('/dashboard');
            });
        }
    });
}

// logout user
const logout = (req, res) => {
    req.logout(() => {
        req.session.message = {
            type: 'success',
            message: 'Logged out successfully!.'
        };
        res.redirect('/auth/signin');
    });
}

const signin = (req, res) => {
    res.render('auth/signin', {title: 'FOOTWEAR HUNTER - Sign In',
    user: req.user});
}

const signup = (req, res) => {
    res.render('auth/signup', {title: 'FOOTWEAR HUNTER - Sign Up',
    user: req.user});
}

module.exports = { signin, signup, loginUser, register, logout};
