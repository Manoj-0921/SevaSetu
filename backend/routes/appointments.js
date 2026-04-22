const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, isAdmin, isDoctor } = require('../middleware/auth');

const { validateDoctorAvailability } = require('../utils/appointmentUtils');

// @route   POST /api/appointments
// @desc    Book a new appointment (patient)
// @access  Private (Patient)
router.post('/', protect, async (req, res) => {
    try {
        const { doctorId, date, time, symptoms, patientContact } = req.body;

        if (!doctorId || !date || !time || !symptoms) {
            return res.status(400).json({ msg: 'Please provide doctorId, date, time and symptoms' });
        }

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        const validationError = await validateDoctorAvailability(doctor, date, time, Appointment);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            date,
            time,
            symptoms,
            patientContact,
            status: 'pending',
        });

        await appointment.populate(['patient', 'doctor']);
        res.status(201).json({ msg: 'Appointment booked successfully', appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET /api/appointments/my
// @desc    Get all appointments of logged-in patient
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name specialization profileImage')
            .sort({ createdAt: -1 });
        res.json({ appointments });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/appointments/doctor
// @desc    Get all appointments for logged-in doctor
// @access  Private (Doctor)
router.get('/doctor', protect, isDoctor, async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone profileImage')
            .sort({ date: 1, time: 1 });
        res.json({ appointments });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/appointments/all
// @desc    Get all appointments (admin only)
// @access  Private (Admin)
router.get('/all', protect, isAdmin, async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patient', 'name email phone')
            .populate('doctor', 'name specialization')
            .sort({ createdAt: -1 });
        res.json({ appointments });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/appointments/booked-slots/:doctorId
// @desc    Get booked slots for a doctor on a specific date
// @access  Private
router.get('/booked-slots/:doctorId', protect, async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ msg: 'Date is required' });

        const appointments = await Appointment.find({
            doctor: req.params.doctorId,
            date,
            status: { $in: ['pending', 'confirmed'] },
        }).select('time');

        const bookedSlots = appointments.map(apt => apt.time);
        res.json({ bookedSlots });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email phone')
            .populate('doctor', 'name specialization profileImage');

        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        // Only patient, doctor, or admin can view
        const userId = req.user._id.toString();
        const isOwner =
            appointment.patient._id.toString() === userId ||
            appointment.doctor._id.toString() === userId ||
            req.user.role === 'admin';

        if (!isOwner) return res.status(403).json({ msg: 'Not authorized' });

        res.json({ appointment });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment (reschedule or add notes)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        const userId = req.user._id.toString();
        const isPatient = appointment.patient.toString() === userId;
        const isDoctorUser = appointment.doctor.toString() === userId;
        const isAdminUser = req.user.role === 'admin';

        if (!isPatient && !isDoctorUser && !isAdminUser) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const doctor = await User.findById(appointment.doctor);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        // Patients can reschedule (change date/time/symptoms)
        if (isPatient) {
            if (appointment.status === 'cancelled' || appointment.status === 'completed') {
                return res.status(400).json({ msg: 'Cannot modify a cancelled or completed appointment' });
            }

            const newDate = req.body.date || appointment.date;
            const newTime = req.body.time || appointment.time;
            if (newDate !== appointment.date || newTime !== appointment.time) {
                const validationError = await validateDoctorAvailability(doctor, newDate, newTime, Appointment, appointment._id);
                if (validationError) {
                    return res.status(400).json(validationError);
                }
            }

            appointment.date = newDate;
            appointment.time = newTime;
            appointment.symptoms = req.body.symptoms || appointment.symptoms;
        }

        // Doctors can update status and add notes
        if (isDoctorUser || isAdminUser) {
            appointment.status = req.body.status || appointment.status;
            appointment.notes = req.body.notes || appointment.notes;
        }

        const updated = await appointment.save();
        res.json({ msg: 'Appointment updated', appointment: updated });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        const userId = req.user._id.toString();
        const isOwner =
            appointment.patient.toString() === userId ||
            appointment.doctor.toString() === userId ||
            req.user.role === 'admin';

        if (!isOwner) return res.status(403).json({ msg: 'Not authorized' });

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ msg: 'Appointment cancelled successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
