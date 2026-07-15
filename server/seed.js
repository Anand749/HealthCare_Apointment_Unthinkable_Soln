const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Leave = require('./models/Leave');
const SlotReservation = require('./models/SlotReservation');
const Prescription = require('./models/Prescription');
const MedicineReminder = require('./models/MedicineReminder');

dotenv.config();

const seedData = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/healsync';
    if (uri.endsWith('/')) uri += 'healsync';
    await mongoose.connect(uri, { dbName: 'healsync' });

    console.log('🗑  Clearing old database...');
    await mongoose.connection.db.dropDatabase();

    console.log('👤 Seeding users...');

    // ── 1. Patient ────────────────────────────────────────────
    const patientUser = await User.create({
      name: 'Alex Mercer',
      email: 'anandchapke11@gmail.com',
      password: 'password123',
      role: 'patient',
      gender: 'male'
    });

    const patientProfile = await Patient.create({
      user: patientUser._id,
      dob: new Date('1994-06-15'),
      gender: 'male',
      bloodGroup: 'O+',
      preferredLanguage: 'English',
      bloodPressureRecords: [
        { systolic: 118, diastolic: 78, date: new Date('2026-02-01') },
        { systolic: 120, diastolic: 80, date: new Date('2026-03-01') },
        { systolic: 122, diastolic: 82, date: new Date('2026-04-01') },
        { systolic: 125, diastolic: 83, date: new Date('2026-05-01') },
        { systolic: 122, diastolic: 80, date: new Date('2026-06-01') },
        { systolic: 124, diastolic: 82, date: new Date('2026-07-01') }
      ],
      weightRecords: [
        { weight: 80, date: new Date('2026-01-01') },
        { weight: 78, date: new Date('2026-03-01') },
        { weight: 75, date: new Date('2026-05-01') },
        { weight: 72, date: new Date('2026-07-01') }
      ],
      glucoseRecords: [
        { level: 98, date: new Date('2026-02-01') },
        { level: 95, date: new Date('2026-04-01') },
        { level: 92, date: new Date('2026-06-01') },
        { level: 95, date: new Date('2026-07-01') }
      ]
    });

    // ── 2. Doctor: Dr. Raj Sharma (Cardiologist) ───────────────
    const docUser1 = await User.create({
      name: 'Dr. Raj Sharma',
      email: 'doctor@healthcare.com',
      password: 'password123',
      role: 'doctor',
      gender: 'male'
    });

    const docProfile1 = await Doctor.create({
      user: docUser1._id,
      specialization: 'Cardiologist',
      department: 'Cardiology',
      experience: 18,
      rating: 4.9,
      consultations: 1240,
      hospital: 'Metro Cardiac Center',
      bio: 'Senior Cardiologist with 18+ years specializing in interventional cardiology, heart failure management and preventive cardiac care.',
      languages: ['English', 'Hindi'],
      availableSlots: ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'],
      workingHours: { start: '09:00 AM', end: '05:00 PM' }
    });

    // ── 3. Doctor: Dr. Sarah Connor (Cardiologist) ─────────────
    const docUser2 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'sarah.c@healthcare.com',
      password: 'password123',
      role: 'doctor',
      gender: 'female'
    });

    await Doctor.create({
      user: docUser2._id,
      specialization: 'Cardiologist',
      department: 'Cardiology',
      experience: 15,
      rating: 4.8,
      consultations: 850,
      hospital: 'HeartCare Institute',
      bio: 'Expert in echocardiography, cardiac rehabilitation, and women\'s heart health. Board-certified cardiologist.',
      languages: ['English', 'Spanish'],
      availableSlots: ['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM']
    });

    // ── 4. Doctor: Dr. Priya Patel (Dermatologist) ────────────
    const docUser3 = await User.create({
      name: 'Dr. Priya Patel',
      email: 'priya.p@healthcare.com',
      password: 'password123',
      role: 'doctor',
      gender: 'female'
    });

    await Doctor.create({
      user: docUser3._id,
      specialization: 'Dermatologist',
      department: 'Dermatology',
      experience: 10,
      rating: 4.7,
      consultations: 620,
      hospital: 'SkinCare Clinic',
      bio: 'Specialist in clinical dermatology, cosmetic procedures, and skin cancer screenings.',
      languages: ['English', 'Hindi', 'Gujarati'],
      availableSlots: ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '04:30 PM']
    });

    // ── 5. Doctor: Dr. Arjun Nair (Neurologist) ───────────────
    const docUser4 = await User.create({
      name: 'Dr. Arjun Nair',
      email: 'arjun.n@healthcare.com',
      password: 'password123',
      role: 'doctor',
      gender: 'male'
    });

    await Doctor.create({
      user: docUser4._id,
      specialization: 'Neurologist',
      department: 'Neurology',
      experience: 12,
      rating: 4.8,
      consultations: 780,
      hospital: 'NeuroLife Hospital',
      bio: 'Specializes in epilepsy, stroke management, migraines, and neurodegenerative disorders.',
      languages: ['English', 'Malayalam'],
      availableSlots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
    });

    // ── 6. Doctor: Dr. Meera Joshi (General Physician) ────────
    const docUser5 = await User.create({
      name: 'Dr. Meera Joshi',
      email: 'meera.j@healthcare.com',
      password: 'password123',
      role: 'doctor',
      gender: 'female'
    });

    await Doctor.create({
      user: docUser5._id,
      specialization: 'General Physician',
      department: 'General Medicine',
      experience: 8,
      rating: 4.6,
      consultations: 1500,
      hospital: 'City Health Clinic',
      bio: 'Primary care physician focused on preventive medicine, chronic disease management and family healthcare.',
      languages: ['English', 'Hindi', 'Marathi'],
      availableSlots: ['08:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:00 PM']
    });

    // ── 7. Admin ───────────────────────────────────────────────
    await User.create({
      name: 'Chief Admin Officer',
      email: 'admin@healthcare.com',
      password: 'password123',
      role: 'admin',
      gender: 'other'
    });

    // ── 8. Seed Appointment ────────────────────────────────────
    console.log('📅 Seeding appointments...');
    const appt1 = await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile1._id,
      date: new Date('2026-07-20'),
      slot: '09:00 AM',
      symptoms: 'Mild chest tightness and shortness of breath after climbing stairs for 3 days. History of hypertension.',
      aiSymptomSummary: '32yo Male presenting chest tightness & exertional dyspnea (3d). HTN history. Check ECG, auscultation. Priority: Moderate.',
      status: 'scheduled'
    });

    await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile1._id,
      date: new Date('2026-06-10'),
      slot: '01:00 PM',
      symptoms: 'Routine cardiac checkup. Follow-up for hypertension.',
      diagnosis: 'Essential Hypertension — Stage 1. BP: 130/85 mmHg. ECG: Normal sinus rhythm.',
      prescription: 'Amlodipine 5mg - Once daily (Morning). Lifestyle modification: Low sodium diet, 30 min daily walking.',
      visitNotes: 'Patient doing well. BP slightly elevated but within manageable range. Advised dietary changes.',
      aiPatientExplanation: 'Good news! Your heart is working well and your ECG looks normal. Your blood pressure is a little higher than ideal, so I\'ve prescribed a gentle medication to help. The most important things you can do at home are to reduce salt in your meals and take a 30-minute walk every day.',
      status: 'completed'
    });

    // ── 9. Seed Medicine Reminders ─────────────────────────────
    console.log('💊 Seeding medicine reminders...');
    await MedicineReminder.create({
      patient: patientProfile._id,
      medicine: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Morning',
      times: ['08:00 AM'],
      duration: 'Ongoing',
      source: 'manual',
      active: true
    });

    await MedicineReminder.create({
      patient: patientProfile._id,
      medicine: 'Aspirin',
      dosage: '75mg',
      frequency: 'Morning',
      times: ['08:30 AM'],
      duration: 'Ongoing',
      source: 'manual',
      active: true
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Patient  → patient@healthcare.com  / password123');
    console.log('   Doctor   → doctor@healthcare.com   / password123');
    console.log('   Admin    → admin@healthcare.com    / password123\n');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
