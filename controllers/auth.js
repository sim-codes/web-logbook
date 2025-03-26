const passport = require('passport');
const { User, Student, Lecturer, Institution, ITF } = require('../models/user');

// Create passport local strategy
passport.use(User.createStrategy());

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// register user in db
const register = async (req, res) => {
    try {
        const { email, password, role, ...additionalDetails } = req.body;
        
        // Create user based on role
        let newUser;
        switch(role) {
            case 'student':
                newUser = new Student({
                    email,
                    role,
                    ...additionalDetails
                });
                break;
            case 'lecturer':
                newUser = new Lecturer({
                    email,
                    role,
                    ...additionalDetails
                });
                break;
            case 'institution':
                newUser = new Institution({
                    email,
                    role,
                    ...additionalDetails
                });
                break;
            case 'itf':
                newUser = new ITF({
                    email,
                    role,
                    ...additionalDetails
                });
                break;
            case 'admin':
                newUser = new User({
                    email,
                    role
                });
                break;
            default:
                return res.status(400).json({ message: 'Invalid user role' });
        }

        // Register the user
        await User.register(newUser, password);

        req.session.message = {
            type: 'success',
            message: 'Account created successfully!'
        };
        res.redirect('/auth/signin');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Account creation failed. Try again!'
        };
        res.redirect('/auth/signup/select-role');
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
            message: 'Logged out successfully!'
        };
        res.redirect('/auth/signin');
    });
}

const signOut = (req, res) => {
    res.render('auth/signout', {
        title: 'eBooklog - Sign Out Confirmation',
        user: req.user
    });
}

const signin = (req, res) => {
    res.render('auth/signin', {
        title: 'eBooklog - Sign In',
        user: req.user
    });
}

const signup = (req, res) => {
    res.render('auth/select-role', {
        title: 'eBooklog - Sign Up',
        user: req.user
    });
}

module.exports = { signin, signup, loginUser, register, logout, signOut };
