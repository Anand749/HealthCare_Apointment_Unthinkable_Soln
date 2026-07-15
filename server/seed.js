const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Leave = require('./models/Leave');
const SlotReservation = require('./models/SlotReservation');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healsync');

    console.log('Clearing old database entries...');
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Leave.deleteMany();
    await SlotReservation.deleteMany();

    console.log('Seeding mock users...');

    // 1. Patient User
    const patientUser = await User.create({
      name: 'Alex Mercer',
      email: 'patient@healthcare.com',
      password: 'password123',
      role: 'patient'
    });

    const patientProfile = await Patient.create({
      user: patientUser._id,
      dob: new Date('1994-06-15'),
      gender: 'male',
      bloodGroup: 'O+',
      preferredLanguage: 'English',
      bloodPressureRecords: [
        { systolic: 120, diastolic: 80, date: new Date('2026-06-01') },
        { systolic: 122, diastolic: 81, date: new Date('2026-07-01') }
      ],
      weightRecords: [
        { weight: 77, date: new Date('2026-06-01') },
        { weight: 72, date: new Date('2026-07-01') }
      ],
      glucoseRecords: [
        { level: 92, date: new Date('2026-06-01') },
        { level: 95, date: new Date('2026-07-01') }
      ]
    });

    // 2. Doctor User (Raj Sharma)
    const docUser1 = await User.create({
      name: 'Dr. Raj Sharma',
      email: 'doctor@healthcare.com',
      password: 'password123',
      role: 'doctor'
    });

    const docProfile1 = await Doctor.create({
      user: docUser1._id,
      specialization: 'Cardiologist',
      experience: 18,
      rating: 4.9,
      consultations: 1240,
      workingHours: { start: '09:00 AM', end: '05:00 PM' },
      languages: ['English', 'Hindi']
    });

    // 3. Another Doctor (Sarah Connor)
    const docUser2 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'sarah.c@healthcare.com',
      password: 'password123',
      role: 'doctor'
    });

    const docProfile2 = await Doctor.create({
      user: docUser2._id,
      specialization: 'Cardiologist',
      experience: 15,
      rating: 4.8,
      consultations: 850,
      workingHours: { start: '08:00 AM', end: '04:00 PM' },
      languages: ['English', 'Spanish']
    });

    // 4. Admin User
    await User.create({
      name: 'Chief Admin Officer',
      email: 'admin@healthcare.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('Seeding mock appointments...');
    await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile1._id,
      date: new Date('2026-07-14'),
      slot: '2:30 PM',
      symptoms: 'Mild chest tightness, shortness of breath after climbing stairs for 3 days.',
      aiSymptomSummary: '32yo Male presenting chest tightness & exertional dyspnea (3d). Focus on auscultation.',
      status: 'scheduled'
    });

    console.log('Database successfully seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
