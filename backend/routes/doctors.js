const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, isDoctor } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors with optional specialization filter
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { specialization, available } = req.query;
        let filter = { role: 'doctor' };

        if (specialization) {
            filter.specialization = { $regex: specialization, $options: 'i' };
        }
        if (available === 'true') {
            filter.isAvailable = true;
        }
        if (req.user?.role === 'admin') {
            // Admin can see all doctors including unverified
        } else {
            filter.isVerified = true;
        }

        const doctors = await User.find(filter).select('-password');
        res.json({ doctors });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET /api/doctors/:id
// @desc    Get a single doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
        res.json({ doctor });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   PUT /api/doctors/profile
// @desc    Update doctor's own profile & availability
// @access  Private (Doctor only)
router.put('/profile', protect, isDoctor, async (req, res) => {
    try {
        const {
            name, phone, bio, specialization, qualification,
            experience, consultationFee, availableDays,
            availableTimeStart, availableTimeEnd, isAvailable, profileImage,
        } = req.body;

        const doctor = await User.findById(req.user._id);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        doctor.name = name || doctor.name;
        doctor.phone = phone || doctor.phone;
        doctor.bio = bio || doctor.bio;
        doctor.specialization = specialization || doctor.specialization;
        doctor.qualification = qualification || doctor.qualification;
        doctor.experience = experience !== undefined ? experience : doctor.experience;
        doctor.consultationFee = consultationFee !== undefined ? consultationFee : doctor.consultationFee;
        doctor.availableDays = availableDays || doctor.availableDays;
        doctor.availableTimeStart = availableTimeStart || doctor.availableTimeStart;
        doctor.availableTimeEnd = availableTimeEnd || doctor.availableTimeEnd;
        doctor.isAvailable = isAvailable !== undefined ? isAvailable : doctor.isAvailable;
        doctor.profileImage = profileImage || doctor.profileImage;

        const updated = await doctor.save();
        res.json({ msg: 'Doctor profile updated', doctor: updated });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   PUT /api/doctors/:id/availability
// @desc    Toggle doctor availability
// @access  Private (Doctor only)
router.put('/:id/availability', protect, isDoctor, async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ msg: 'Doctor not found' });
        }

        if (doctor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized to update this profile' });
        }

        doctor.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !doctor.isAvailable;
        await doctor.save();
        res.json({ msg: 'Availability updated', isAvailable: doctor.isAvailable });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
