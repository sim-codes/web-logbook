module.exports = function (req, res, next) {
    if (req.user && req.user.role === 'itf') {
        return next();
    }
    req.session.message = {
        type: 'danger',
        message: 'Unauthorized access'
    };
    res.redirect('/dashboard');
};
