const { Student } = require('../models/user');
const Bank = require('../models/bank');

const getBankDetails = async (req, res) => {
    try {
        const bankDetails = await Bank.findOne({ student: req.user._id });

        res.render('student/bank', {
        title: 'eBooklog - Student Account',
        user: req.user,
        bankDetails
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error fetching bank details'
        };
        res.redirect('/dashboard');
    }
};

const postBankDetails = async (req, res) => {
    try {
        const existingAccount = await Bank.findOne({ student: req.user._id });
        if (existingAccount) {
            req.session.message = {
                type: 'danger',
                message: 'You already have a bank account registered'
            };
            res.redirect('/student/bank-details');
        }

        const newBank = new Bank({
        student: req.user._id,
        ...req.body
        });

        await newBank.save();
        req.session.message = {
            type: 'success',
            message: 'Bank account created successfully!'
        };
        res.redirect('/student/bank-details');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error creating bank account'
        };
        res.redirect('/student/bank-details');
    }
};

module.exports = {
    getBankDetails,
    postBankDetails
};