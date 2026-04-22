
const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const fetchData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthblock');
        console.log('Connected to MongoDB');

        console.log('\n--- Recent Appointments ---');
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('doctor', 'name availableDays availableTimeStart availableTimeEnd');

        appointments.forEach(apt => {
            console.log(`ID: ${apt._id}`);
            console.log(`Date: ${apt.date}`);
            console.log(`Time: ${apt.time}`);
            console.log(`Doctor: ${apt.doctor ? apt.doctor.name : 'Unknown'}`);
            if (apt.doctor) {
                console.log(`Doctor Available Days: ${apt.doctor.availableDays}`);
            }
            console.log(`Status: ${apt.status}`);
            console.log('---------------------------');
        });

        console.log('\n--- All Doctors Availability ---');
        const doctors = await User.find({ role: 'doctor' });
        doctors.forEach(doc => {
            console.log(`Doctor: ${doc.name}`);
            console.log(`Available Days: ${doc.availableDays}`);
            console.log(`Available Time: ${doc.availableTimeStart} - ${doc.availableTimeEnd}`);
            console.log(`isAvailable: ${doc.isAvailable}`);
            console.log('---------------------------');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fetchData();
