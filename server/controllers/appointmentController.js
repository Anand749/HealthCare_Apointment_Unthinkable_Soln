const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const SlotReservation = require('../models/SlotReservation');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendEmailWithRetry } = require('../config/email');

// ======================================================
// @desc    Reserve a slot (Requirement 2: 5-minute Slot Hold)
// @route   POST /api/appointments/hold
// @access  Private (Patient)
// ======================================================
exports.holdSlot = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;
    if (!doctorId || !date || !slot) {
      return res.status(400).json({ success: false, error: 'doctorId, date, and slot are required' });
    }

    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // Clean up expired slot reservations automatically
    await SlotReservation.deleteMany({ expiresAt: { $lt: new Date() } });

    // Check if there is an active (non-expired) reservation for this slot
    const existingReservation = await SlotReservation.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      expiresAt: { $gte: new Date() }
    });

    if (existingReservation) {
      const remainingMs = existingReservation.expiresAt - new Date();
      const remainingSec = Math.ceil(remainingMs / 1000);
      return res.status(400).json({
        success: false,
        error: `This slot is temporarily held by another patient. Try again in ${remainingSec} seconds.`
      });
    }

    // Check if slot is already permanently booked
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, error: 'This slot is already booked. Please choose another.' });
    }

    // Create 5-minute hold
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
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
      data: hold,
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Book Appointment using MongoDB Transaction (Requirement 1: Double Booking Prevention)
// @route   POST /api/appointments/book
// @access  Private (Patient)
// ======================================================
exports.bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { doctorId, date, slot, symptoms } = req.body;
    if (!doctorId || !date || !slot || !symptoms) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'doctorId, date, slot, and symptoms are required' });
    }

    const patient = await Patient.findOne({ user: req.user.id }).session(session);
    if (!patient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // 1. Verify that a hold exists for this patient on this slot
    const hold = await SlotReservation.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      patient: patient._id,
      expiresAt: { $gte: new Date() }
    }).session(session);

    if (!hold) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'No active reservation found for this slot. Please select a slot and hold it first (valid for 5 minutes).'
      });
    }

    // 2. Double-check no concurrent booking snuck through (race condition guard)
    const activeBooking = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      slot,
      status: { $in: ['scheduled', 'completed'] }
    }).session(session);

    if (activeBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'Double Booking Prevented: This slot was just booked by another patient.' });
    }

    // 3. Create appointment atomically
    const appointment = await Appointment.create([{
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
      slot,
      symptoms,
      aiSymptomSummary: 'Pending AI Analysis',
      status: 'scheduled'
    }], { session });

    // 4. Release the slot hold
    await SlotReservation.deleteOne({ _id: hold._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    // 5. Send confirmation email asynchronously (non-blocking)
    const doc = await Doctor.findById(doctorId).populate('user', 'name');
    const doctorName = doc?.user?.name || 'Your Doctor';
    const appointmentDate = new Date(date).toDateString();

    sendEmailWithRetry(
      req.user.email,
      'Appointment Confirmed — HealSync Healthcare',
      `Dear ${req.user.name},\n\nYour appointment with ${doctorName} on ${appointmentDate} at ${slot} has been successfully scheduled.\n\nSymptoms noted: ${symptoms}\n\nPlease arrive 10 minutes early. If you need to reschedule, visit our portal.\n\nHealSync Healthcare Team`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;background:#f0f9ff;border-radius:12px">
        <h2 style="color:#0ea5e9">✅ Appointment Confirmed</h2>
        <p>Dear <strong>${req.user.name}</strong>,</p>
        <p>Your appointment has been successfully scheduled:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;font-weight:bold">Doctor</td><td style="padding:8px">${doctorName}</td></tr>
          <tr style="background:#e0f2fe"><td style="padding:8px;font-weight:bold">Date</td><td style="padding:8px">${appointmentDate}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${slot}</td></tr>
        </table>
        <p style="color:#64748b;font-size:14px">Please arrive 10 minutes early with your documents.</p>
        <p>— HealSync Healthcare Team</p>
      </div>`
    );

    res.status(201).json({
      success: true,
      message: 'Appointment successfully confirmed!',
      data: appointment[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Double Booking Prevention: This slot is already finalized in the database.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get doctor's appointment schedule
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
// ======================================================
exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const filter = { doctor: doctor._id };

    // Filter by status or date range if query params provided
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(req.query.date);
      dEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: d, $lte: dEnd };
    }

    const appointments = await Appointment.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Accept or reject an appointment (Doctor)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor)
// ======================================================
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'rejected', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id
    }).populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found or does not belong to you' });
    }

    appointment.status = status;
    await appointment.save();

    // Notify patient of status change
    if (appointment.patient?.user?.email) {
      const statusMessages = {
        scheduled: 'Your appointment has been confirmed by the doctor.',
        rejected: 'Unfortunately, your appointment has been declined. Please reschedule.',
        completed: 'Your appointment has been marked as completed.',
        cancelled: 'Your appointment has been cancelled.'
      };
      sendEmailWithRetry(
        appointment.patient.user.email,
        `Appointment Update — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Dear ${appointment.patient.user.name},\n\n${statusMessages[status]}\n\nVisit HealSync to reschedule or view your health history.\n\n— HealSync Team`
      );
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Write consultation details (Diagnosis & Prescription)
// @route   PUT /api/appointments/:id/consult
// @access  Private (Doctor)
// ======================================================
exports.updateConsultation = async (req, res) => {
  try {
    const { diagnosis, prescription, visitNotes, aiPatientExplanation } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });
    let appointment;

    if (doctor) {
      appointment = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
    } else {
      // Admin override
      appointment = await Appointment.findById(req.params.id);
    }

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (visitNotes !== undefined) appointment.visitNotes = visitNotes;
    if (aiPatientExplanation !== undefined) appointment.aiPatientExplanation = aiPatientExplanation;
    appointment.status = 'completed';

    await appointment.save();

    // Increment doctor consultation count
    if (doctor) {
      await Doctor.findByIdAndUpdate(doctor._id, { $inc: { consultations: 1 } });
    }

    res.status(200).json({ success: true, message: 'Consultation saved successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get patient's appointment history
// @route   GET /api/appointments/patient
// @access  Private (Patient)
// ======================================================
exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const filter = { patient: patient._id };
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get all appointments (Admin)
// @route   GET /api/appointments/all
// @access  Private (Admin)
// ======================================================
exports.getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, page, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
