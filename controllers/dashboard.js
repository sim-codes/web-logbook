// controllers/dashboard.js
const Logbook = require('../models/logbook');
const mongoose = require('mongoose');
const upload = require('../multer');

const dashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1;
        const skip = (page - 1) * limit;

        // Determine query based on user role
        const queryCondition = req.user.role === 'student' ? { student: req.user._id } : {};

        const totalLogs = await Logbook.countDocuments(queryCondition);
        const logs = await Logbook.find(queryCondition)
            .limit(limit)
            .skip(skip)
            .sort({ day: -1 });

        res.render('dashboard', {
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
        };
        res.redirect('/');
    }
};

// Create New Log
const createLog = async (req, res) => {
    try {
        const { day, work } = req.body;
        const images = req.files?.map(file => file.filename) || [];

        const newLog = new Logbook({
            day,
            work,
            images,
            student: req.user._id
        });

        await newLog.save();

        req.session.message = {
            type: 'success',
            message: 'Log created successfully'
        };
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error creating log'
        };
        res.redirect('/logbooks/new');
    }
};

// Edit Log Form
const getEditLog = async (req, res) => {
    try {
        const log = await Logbook.findOne({
            _id: req.params.id,
            student: req.user._id
        });
        
        if (!log) {
            req.session.message = {
                type: 'danger',
                message: 'Log not found'
            };
            return res.redirect('/dashboard');
        }
        
        res.render('logbooks/edit', {
            title: 'Edit Log',
            user: req.user,
            log
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Update Log
const updateLog = async (req, res) => {
    try {
        const { day, work } = req.body;
        const images = req.files?.map(file => file.filename) || [];
        
        const log = await Logbook.findOneAndUpdate(
            { _id: req.params.id, student: req.user._id },
            { day, work, $push: { images: { $each: images } } },
            { new: true }
        );
        
        if (!log) {
            req.session.message = {
                type: 'danger',
                message: 'Log not found'
            };
            return res.redirect('/dashboard');
        }
        
        req.session.message = {
            type: 'success',
            message: 'Log updated successfully'
        };
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error updating log'
        };
        res.redirect(`/logbooks/${req.params.id}/edit`);
    }
};

// Delete Log
const deleteLog = async (req, res) => {
    try {
        const log = await Logbook.findOneAndDelete({
            _id: req.params.id,
            student: req.user._id
        });
        
        if (!log) {
            req.session.message = {
                type: 'danger',
                message: 'Log not found'
            };
            return res.redirect('/dashboard');
        }
        
        req.session.message = {
            type: 'success',
            message: 'Log deleted successfully'
        };
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error deleting log'
        };
        res.redirect('/dashboard');
    }
};

module.exports = { dashboard, createLog, getEditLog, updateLog, deleteLog };
