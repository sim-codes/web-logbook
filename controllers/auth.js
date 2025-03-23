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
        const regsiteredUser = await user.register({ email: req.body.email, username: req.body.email, password: req.body.password, role: req.body.role }, req.body.password);
        if(regsiteredUser) {
            req.session.message = {
                type: 'success',
                message: 'Account created successfully!.'
            };
            res.redirect('/auth/signin');
        } else {
            res.redirect('/auth/signup');
        }
    } catch (err) {
        console.log(err);
        req.session.message = {
            type: 'danger',
            message: 'Account creation failed, Try again!.'
        };
        res.redirect('/auth/signup');
    }
}

const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            req.session.message = {
                type: 'danger',
                message: 'An error occurred. Please try again.'
            };
            return res.redirect('/auth/signin');
        }
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: info ? info.message : 'Invalid credentials'
            };
            return res.redirect('/auth/signin');
        }

        // Log the user in after successful authentication
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                req.session.message = {
                    type: 'danger',
                    message: 'Login failed. Please try again.'
                };
                return res.redirect('/auth/signin');
            }

            req.session.message = {
                type: 'success',
                message: 'Welcome back. Logged in successfully!'
            };
            return res.redirect('/dashboard');
        });
    })(req, res, next);  // Execute passport middleware properly
};


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
    res.render('auth/signin', {title: 'eBooklog - Sign In',
    user: req.user});
}

const signup = (req, res) => {
    res.render('auth/signup', {title: 'eBooklog - Sign Up',
    user: req.user});
}

module.exports = { signin, signup, loginUser, register, logout};
