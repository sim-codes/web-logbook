const Logbook = require('../models/logbook');

const dashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1
        const skip = (page - 1) * limit;

        const totalLogs = await Logbook.countDocuments({ student: req.user._id });
        const logs = await Logbook.find({ student: req.user._id }).limit(limit).skip(skip).sort({ day: -1 });

        res.render('dashboard',
            {
                title: 'eBooklog - Dashboard',
                user: req.user,
                logs,
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
            });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error retrieving work logs'
        }
        res.redirect('/');
    }
}

module.exports = { dashboard};
