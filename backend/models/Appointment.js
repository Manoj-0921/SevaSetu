const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // stored as "YYYY-MM-DD"
        required: [true, 'Appointment date is required'],
    },
    time: {
        type: String, // stored as "10:00 AM"
        required: [true, 'Appointment time is required'],
    },
    symptoms: {
        type: String,
        required: [true, 'Symptoms are required'],
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    notes: {
        type: String, // doctor's post-consultation notes
        default: '',
    },
    patientContact: {
        type: String,
    },
}, { timestamps: true });

// Prevent double booking at the database level
// Unique index on doctor, date, and time for appointments that are pending or confirmed
appointmentSchema.index(
    { doctor: 1, date: 1, time: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['pending', 'confirmed'] }
        }
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
