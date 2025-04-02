module.exports = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.message = {
            type: 'danger',
            message: 'Login to continue'
        };
        res.redirect('/auth/signin');
    }
};
