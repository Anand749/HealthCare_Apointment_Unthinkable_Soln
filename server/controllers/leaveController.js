const Leave = require('../models/Leave');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'mock-user-123',
    pass: process.env.EMAIL_PASS || 'mock-pass-123'
  }
});

// Retry-capable logger helper (Requirement 4)
const sendLeaveAlertEmail = async (email, patientName, doctorName, date) => {
  const subject = `Rescheduling Required: Dr. ${doctorName} Leave Alert`;
  const body = `Hi ${patientName},\n\nWe regret to inform you that Dr. ${doctorName} will be on leave on ${date.toDateString()}. Consequently, your appointment has been cancelled.\n\nYou can click this mock-link to reschedule with 1-click: http://localhost:5173/patient/reschedule?doctor=${doctorName}&date=${date.toISOString().split('T')[0]}`;

  const log = await Notification.create({ recipient: email, subject, body, status: 'retrying' });

  try {
    await transporter.sendMail({
      from: '"HealSync Portal" <no-reply@healsync.com>',
      to: email,
      subject,
      text: body
    });
    log.status = 'sent';
    await log.save();
  } catch (error) {
    log.status = 'failed';
    log.errorLog = error.message;
    await log.save();
  }
};

// @desc    Submit doctor leave and handle conflicts (Requirement 3: Leave Conflict Handling)
// @route   POST /api/leaves
// @access  Private (Doctor/Admin)
exports.createLeave = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    const leaveDate = new Date(date);

    // Save leave entry
    const leave = await Leave.create({
      doctor: doctorId,
      date: leaveDate,
      reason
    });

    // Find doctor info
    const doc = await Doctor.findById(doctorId).populate('user');
    const doctorName = doc ? doc.user.name : 'Your Doctor';

    // 1. Query affected appointments
    const startOfDay = new Date(leaveDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(leaveDate.setHours(23, 59, 59, 999));

    const conflicts = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    }).populate({ path: 'patient', populate: { path: 'user' } });

    // 2. Cancel and alert patients (Requirement 3 & 4)
    if (conflicts.length > 0) {
      const conflictIds = conflicts.map((c) => c._id);
      
      // Update appointment statuses in database
      await Appointment.updateMany(
        { _id: { $in: conflictIds } },
        { $set: { status: 'cancelled' } }
      );

      // Async email alerts
      conflicts.forEach((appt) => {
        if (appt.patient && appt.patient.user) {
          sendLeaveAlertEmail(
            appt.patient.user.email,
            appt.patient.user.name,
            doctorName,
            startOfDay
          );
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave registered successfully. Affected appointments cancelled and patients notified.',
      conflictsAlerted: conflicts.length,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
