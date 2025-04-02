const { User, Student, Lecturer, Institution, ITF } = require('../models/user');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('institution supervisor studentsSupervised students')
            .exec();
        res.render('profile', {
            title: 'Profile',
            user: user.toObject(),
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error fetching profile'
        };
        res.redirect('/');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email
        };

        // Role-specific updates
        switch(req.user.role) {
            case 'student':
                updateData.matricNumber = req.body.matricNumber;
                updateData.institution = req.body.institution;
                updateData.supervisor = req.body.supervisor;
                break;
            case 'lecturer':
                updateData.staffId = req.body.staffId;
                updateData.institution = req.body.institution;
                break;
            case 'institution':
                updateData.address = req.body.address;
                break;
            case 'itf':
                updateData.region = req.body.region;
                updateData.officeAddress = req.body.officeAddress;
                break;
        }

        const Model = getUserModel(req.user.role);
        await Model.findByIdAndUpdate(req.user._id, updateData, { runValidators: true });

        req.session.message = {
            type: 'success',
            message: 'Profile updated successfully'
        };
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error updating profile'
        };
        res.redirect('/profile');
    }
};

function getUserModel(role) {
    switch(role) {
        case 'student': return Student;
        case 'lecturer': return Lecturer;
        case 'institution': return Institution;
        case 'itf': return ITF;
        default: return User;
    }
}
