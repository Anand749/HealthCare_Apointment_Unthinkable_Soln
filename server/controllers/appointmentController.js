const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const SlotReservation = require('../models/SlotReservation');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Mock email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'mock-user-123',
    pass: process.env.EMAIL_PASS || 'mock-pass-123'
  }
});

// Helper: send email with automatic retry logging (Requirement 4)
const sendEmailWithLogging = async (recipient, subject, body) => {
  const log = await Notification.create({ recipient, subject, body, status: 'retrying' });

  try {
    await transporter.sendMail({
      from: '"HealSync Clinical Portal" <no-reply@healsync.com>',
      to: recipient,
      subject: subject,
      text: body
    });
    log.status = 'sent';
    await log.save();
    return true;
  } catch (error) {
    log.status = 'failed';
    log.errorLog = error.message;
    await log.save();
    console.error(`Email send failed to ${recipient}: ${error.message}. Logged for retry.`);
    return false;
  }
};

// @desc    Reserve a slot (Requirement 2: 5-minute Slot Hold)
// @route   POST /api/appointments/hold
// @access  Private (Patient)
exports.holdSlot = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;

    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // Check if there is an active reservation
    const existingReservation = await SlotReservation.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot
    });

    if (existingReservation) {
      return res.status(400).json({ success: false, error: 'This slot is temporarily held by another patient' });
    }

    // Check if slot is already booked
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, error: 'This slot is already booked' });
    }

    // Create 5 minute hold
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const hold = await SlotReservation.create({
      doctor: doctorId,
      date: new Date(date),
      slot,
      patient: patient._id,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Slot successfully reserved for 5 minutes',
      data: hold
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Book Appointment using MongoDB Transaction (Requirement 1: Double Booking Prevention)
// @route   POST /api/appointments/book
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { doctorId, date, slot, symptoms } = req.body;

    const patient = await Patient.findOne({ user: req.user.id }).session(session);
    if (!patient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // 1. Verify if hold belongs to this user (Must confirm reservation)
    const hold = await SlotReservation.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      patient: patient._id
    }).session(session);

    if (!hold) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'No active reservation found for this slot. Please select and hold first.' });
    }

    // 2. Double check if slot has already been finalized by someone else (race conditions)
    const activeBooking = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      status: { $in: ['scheduled', 'completed'] }
    }).session(session);

    if (activeBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'Slot was booked by another concurrent request.' });
    }

    // 3. Generate appointment (Atomic compound index unique check on MongoDB level prevents duplication)
    const appointment = await Appointment.create([{
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
      slot,
      symptoms,
      aiSymptomSummary: 'Pending AI Analysis', // Run asynchronously or mock
      status: 'scheduled'
    }], { session });

    // 4. Remove slot hold
    await SlotReservation.deleteOne({ _id: hold._id }).session(session);

    // Commit Transaction (Atomicity guaranteed)
    await session.commitTransaction();
    session.endSession();

    // Send confirmation email asynchronously (Requirement 4)
    const doc = await Doctor.findById(doctorId).populate('user');
    const doctorName = doc ? doc.user.name : 'Your Doctor';
    sendEmailWithLogging(
      req.user.email,
      'Appointment Confirmation - HealSync',
      `Your consultation with ${doctorName} on ${date} at ${slot} has been successfully scheduled.`
    );

    res.status(201).json({
      success: true,
      message: 'Appointment successfully confirmed!',
      data: appointment[0]
    });
  } catch (error) {
    // Rollback changes on duplicate key error or database fault
    await session.abortTransaction();
    session.endSession();
    
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Double Booking Prevention: Slot already finalized.' });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Doctor's Consultation Schedule
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor record not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({ path: 'patient', populate: { path: 'user' } });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Write Consultation Details (Diagnosis & Prescription)
// @route   PUT /api/appointments/:id/consult
// @access  Private (Doctor)
exports.updateConsultation = async (req, res) => {
  try {
    const { diagnosis, prescription, visitNotes, aiPatientExplanation } = req.body;

    let appointment = await Appointment.findById(req.api_id || req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;
    appointment.visitNotes = visitNotes;
    appointment.aiPatientExplanation = aiPatientExplanation;
    appointment.status = 'completed';

    await appointment.save();

    res.status(200).json({ success: true, message: 'Consultation saved successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Patient's Appointments
// @route   GET /api/appointments/patient
// @access  Private (Patient)
exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 }); // Sort by latest date first

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
