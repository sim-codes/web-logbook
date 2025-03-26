const { session } = require('passport');

const home = async (req, res) => {
    if (req.user)  return res.redirect('/dashboard');
    res.render('index', {title: 'Welcome to eBooklog',
    session: req.session,
    user: req.user});
}

module.exports = { home };