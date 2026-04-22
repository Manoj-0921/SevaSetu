const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
    await connectDB();

    // Clear existing seeded data (optional: comment out to keep existing)
    await User.deleteMany({ email: { $in: ['admin@healthblock.com', 'dr.john@healthblock.com', 'dr.jane@healthblock.com', 'dr.emily@healthblock.com', 'dr.mike@healthblock.com', 'dr.sarah@healthblock.com', 'patient@healthblock.com'] } });

    // Create Admin
    await User.create({
        name: 'Admin',
        email: 'admin@healthblock.com',
        password: 'Admin@123',
        role: 'admin',
    });
    console.log('✅ Admin created: admin@healthblock.com / Admin@123');

    // Create Doctors
    const doctors = [
        {
            name: 'Dr. John Doe',
            email: 'dr.john@healthblock.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'Cardiologist',
            qualification: 'MBBS, MD (Cardiology)',
            experience: 12,
            consultationFee: 800,
            bio: 'Specialist in heart conditions with 12+ years of clinical experience.',
            availableDays: ['Monday', 'Wednesday', 'Friday'],
            availableTimeStart: '09:00 AM',
            availableTimeEnd: '04:00 PM',
            isAvailable: true,
            rating: 4.8,
            profileImage: 'https://cdn.pixabay.com/photo/2019/07/30/15/57/dentist-4373290_640.jpg',
        },
        {
            name: 'Dr. Jane Smith',
            email: 'dr.jane@healthblock.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'Pediatrician',
            qualification: 'MBBS, DCH',
            experience: 8,
            consultationFee: 600,
            bio: 'Dedicated to child health and well-being for over 8 years.',
            availableDays: ['Tuesday', 'Thursday', 'Saturday'],
            availableTimeStart: '10:00 AM',
            availableTimeEnd: '05:00 PM',
            isAvailable: false,
            rating: 4.9,
            profileImage: 'https://cdn.pixabay.com/photo/2017/05/23/17/12/doctor-2337835_1280.jpg',
        },
        {
            name: 'Dr. Emily Johnson',
            email: 'dr.emily@healthblock.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'Dermatologist',
            qualification: 'MBBS, MD (Dermatology)',
            experience: 7,
            consultationFee: 700,
            bio: 'Expert in skin conditions, cosmetic dermatology and hair treatment.',
            availableDays: ['Monday', 'Tuesday', 'Friday'],
            availableTimeStart: '09:00 AM',
            availableTimeEnd: '03:00 PM',
            isAvailable: true,
            rating: 4.7,
            profileImage: 'https://cdn.pixabay.com/photo/2017/01/29/21/16/nurse-2019420_1280.jpg',
        },
        {
            name: 'Dr. Michael Brown',
            email: 'dr.mike@healthblock.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'General Practitioner',
            qualification: 'MBBS',
            experience: 10,
            consultationFee: 500,
            bio: 'Providing comprehensive primary care for patients of all ages.',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableTimeStart: '09:00 AM',
            availableTimeEnd: '05:00 PM',
            isAvailable: true,
            rating: 4.6,
            profileImage: 'https://cdn.pixabay.com/photo/2024/05/29/08/03/ai-generated-8795644_1280.jpg',
        },
        {
            name: 'Dr. Sarah Davis',
            email: 'dr.sarah@healthblock.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'Oncologist',
            qualification: 'MBBS, MD (Oncology)',
            experience: 15,
            consultationFee: 1200,
            bio: 'Pioneering cancer care through research-backed treatment protocols.',
            availableDays: ['Wednesday', 'Thursday', 'Friday'],
            availableTimeStart: '11:00 AM',
            availableTimeEnd: '06:00 PM',
            isAvailable: false,
            rating: 4.9,
            profileImage: 'https://cdn.pixabay.com/photo/2016/11/08/05/29/operation-1807543_640.jpg',
        },
    ];

    for (const doc of doctors) {
        await User.create(doc);
        console.log(`✅ Doctor created: ${doc.email}`);
    }

    // Create Patient
    await User.create({
        name: 'John Patient',
        email: 'patient@healthblock.com',
        password: 'Patient@123',
        role: 'patient',
        phone: '9876543210'
    });
    console.log('✅ Patient created: patient@healthblock.com / Patient@123');

    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin:   admin@healthblock.com  /  Admin@123');
    console.log('Doctors: dr.john@healthblock.com  /  Doctor@123');
    console.log('Patient: patient@healthblock.com  /  Patient@123');
    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
