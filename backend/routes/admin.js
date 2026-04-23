const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, isAdmin } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Private (Admin)
router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

        res.json({
            stats: {
                totalPatients,
                totalDoctors,
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                cancelledAppointments,
            },
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/admin/doctors/pending
// @desc    Get unverified doctors for admin review
// @access  Private (Admin)
router.get('/doctors/pending', protect, isAdmin, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', isVerified: false }).select('-password');
        res.json({ doctors });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/admin/doctors
// @desc    Create a doctor account
// @access  Private (Admin)
router.post('/doctors', protect, isAdmin, async (req, res) => {
    try {
        const { name, email, password, phone, specialization, qualification, experience, consultationFee, bio, availableDays, availableTimeStart, availableTimeEnd } = req.body;

        if (!name || !email || !password || !specialization) {
            return res.status(400).json({ msg: 'Name, email, password and specialization are required' });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'Email already registered' });

        const doctor = await User.create({
            name,
            email,
            password,
            phone,
            specialization,
            qualification,
            experience,
            consultationFee,
            bio,
            availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableTimeStart: availableTimeStart || '09:00 AM',
            availableTimeEnd: availableTimeEnd || '05:00 PM',
            role: 'doctor',
            isVerified: true,
        });

        res.status(201).json({ msg: 'Doctor created successfully', doctor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ msg: 'Cannot delete an admin user' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/admin/doctors/:id/verify
// @desc    Verify a doctor
// @access  Private (Admin)
router.put('/doctors/:id/verify', protect, isAdmin, async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        doctor.isVerified = true;
        await doctor.save();
        res.json({ msg: 'Doctor verified successfully', doctor });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/admin/doctors/:id/reject
// @desc    Reject a doctor
// @access  Private (Admin)
router.put('/doctors/:id/reject', protect, isAdmin, async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Doctor rejected and removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/admin/appointments/:id/status
// @desc    Update appointment status (admin)
// @access  Private (Admin)
router.put('/appointments/:id/status', protect, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        appointment.status = status;
        await appointment.save();
        res.json({ msg: 'Status updated', appointment });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
