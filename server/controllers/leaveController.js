const Leave = require('../models/Leave');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendEmailWithRetry } = require('../config/email');

// ======================================================
// @desc    Submit doctor leave & handle conflicts (Requirement 3)
// @route   POST /api/leaves
// @access  Private (Doctor / Admin)
// ======================================================
exports.createLeave = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, error: 'doctorId and date are required' });
    }

    const leaveDate = new Date(date);

    // Prevent duplicate leave entries for the same day
    const existingLeave = await Leave.findOne({
      doctor: doctorId,
      date: {
        $gte: new Date(leaveDate.setHours(0, 0, 0, 0)),
        $lte: new Date(leaveDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingLeave) {
      return res.status(400).json({ success: false, error: 'Leave already registered for this date' });
    }

    // Reset for use below
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    // Save leave
    const leave = await Leave.create({
      doctor: doctorId,
      date: startOfDay,
      reason: reason || 'Personal Leave'
    });

    // Find doctor info
    const doc = await Doctor.findById(doctorId).populate('user', 'name');
    const doctorName = doc?.user?.name || 'The Doctor';

    // Find all affected scheduled appointments on the leave day
    const conflicts = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    }).populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

    // Cancel all conflicts
    if (conflicts.length > 0) {
      const conflictIds = conflicts.map(c => c._id);
      await Appointment.updateMany(
        { _id: { $in: conflictIds } },
        { $set: { status: 'cancelled' } }
      );

      // Notify each affected patient asynchronously (Requirement 4 — logged email)
      conflicts.forEach((appt) => {
        if (appt.patient?.user?.email) {
          const rescheduleUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/patient?tab=book&doctorId=${doctorId}`;
          sendEmailWithRetry(
            appt.patient.user.email,
            `Appointment Cancelled — Dr. ${doctorName} on Leave`,
            `Dear ${appt.patient.user.name},\n\nWe regret to inform you that Dr. ${doctorName} will be on leave on ${targetDate.toDateString()}.\n\nYour appointment scheduled on this day has been cancelled.\n\nYou can reschedule here: ${rescheduleUrl}\n\n— HealSync Healthcare Team`,
            `<div style="font-family:sans-serif;padding:20px;background:#fff8f0;border-radius:12px;max-width:600px">
              <h2 style="color:#f97316">⚠️ Appointment Cancelled</h2>
              <p>Dear <strong>${appt.patient.user.name}</strong>,</p>
              <p>Dr. <strong>${doctorName}</strong> will be on leave on <strong>${targetDate.toDateString()}</strong>.</p>
              <p>Your appointment has been automatically cancelled.</p>
              <p><a href="${rescheduleUrl}" style="background:#0ea5e9;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">Reschedule Now →</a></p>
              <p style="color:#94a3b8;font-size:12px;margin-top:20px">— HealSync Healthcare Team</p>
            </div>`
          );
        }
      });
    }

    res.status(201).json({
      success: true,
      message: `Leave registered. ${conflicts.length} appointment(s) cancelled and patients notified.`,
      conflictsAlerted: conflicts.length,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get leave history for a doctor
// @route   GET /api/leaves/:doctorId
// @access  Private (Doctor / Admin)
// ======================================================
exports.getDoctorLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ doctor: req.params.doctorId })
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Delete/cancel a leave
// @route   DELETE /api/leaves/:id
// @access  Private (Doctor / Admin)
// ======================================================
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave not found' });
    }
    res.status(200).json({ success: true, message: 'Leave cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get all leaves (Admin)
// @route   GET /api/leaves
// @access  Private (Admin)
// ======================================================
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ date: -1 });

    const enriched = await Promise.all(leaves.map(async (leave) => {
      const startOfDay = new Date(leave.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(leave.date);
      endOfDay.setHours(23, 59, 59, 999);

      const affectedCount = await Appointment.countDocuments({
        doctor: leave.doctor?._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      return {
        _id: leave._id,
        doctorName: leave.doctor?.user?.name || 'Unknown Doctor',
        doctorId: leave.doctor?._id,
        date: leave.date,
        reason: leave.reason,
        status: leave.status,
        affectedAppointments: affectedCount
      };
    }));

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


