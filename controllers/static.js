const { session } = require('passport');

const home = async (req, res) => {

    res.render('index', {title: 'Welcome to FOOTWEAR HUNTER',
    session: req.session,
    user: req.user});
}

module.exports = { home };