const { Student } = require('../models/user');
const ITEMS_PER_PAGE = 10;

const getITFStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const [students, total] = await Promise.all([
            Student.find()
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('institution', 'name'),
            Student.countDocuments()
        ]);

        res.render('itf/students-list', {
            title: 'eBooklog - Students',
            students,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error fetching students'
        };
        res.redirect('/dashboard');
    }
};

module.exports = {
    getITFStudents
};
