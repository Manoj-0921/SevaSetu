const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new patient
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, gender, dateOfBirth, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide name, email and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            gender,
            dateOfBirth,
            address,
            role: req.body.role === 'doctor' ? 'doctor' : 'patient',
        });

        res.status(201).json({
            msg: 'Registration successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login patient or doctor or admin
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        res.json({
            msg: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                specialization: user.specialization,
                profileImage: user.profileImage,
            },
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, gender, dateOfBirth, address } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.gender = gender || user.gender;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.address = address || user.address;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updated = await user.save();
        res.json({
            msg: 'Profile updated',
            user: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                phone: updated.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
