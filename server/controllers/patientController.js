const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicineReminder = require('../models/MedicineReminder');

// ======================================================
// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient)
// ======================================================
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Update patient health metrics (BP, weight, glucose)
// @route   PUT /api/patients/metrics
// @access  Private (Patient)
// ======================================================
exports.updateHealthMetrics = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { bloodPressure, weight, glucose } = req.body;

    // Append new records (don't overwrite history)
    if (bloodPressure && bloodPressure.systolic && bloodPressure.diastolic) {
      patient.bloodPressureRecords.push({
        date: new Date(),
        systolic: bloodPressure.systolic,
        diastolic: bloodPressure.diastolic
      });
    }

    if (weight) {
      patient.weightRecords.push({
        date: new Date(),
        weight
      });
    }

    if (glucose) {
      patient.glucoseRecords.push({
        date: new Date(),
        level: glucose
      });
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Health metrics updated successfully',
      data: {
        bloodPressureRecords: patient.bloodPressureRecords,
        weightRecords: patient.weightRecords,
        glucoseRecords: patient.glucoseRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get health timeline (appointments, prescriptions, notes)
// @route   GET /api/patients/timeline
// @access  Private (Patient)
// ======================================================
exports.getHealthTimeline = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // Fetch all appointments with doctor info
    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    // Fetch all prescriptions
    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    // Build timeline events
    const timelineEvents = [];

    appointments.forEach((appt) => {
      timelineEvents.push({
        id: appt._id,
        type: 'appointment',
        date: appt.date,
        title: `Consultation with Dr. ${appt.doctor?.user?.name || 'Unknown'}`,
        subtitle: appt.doctor?.specialization || '',
        description: appt.symptoms || '',
        status: appt.status,
        diagnosis: appt.diagnosis || '',
        visitNotes: appt.visitNotes || '',
        aiExplanation: appt.aiPatientExplanation || ''
      });

      // If appointment has prescription text, add prescription event
      if (appt.prescription) {
        timelineEvents.push({
          id: `${appt._id}-rx`,
          type: 'prescription',
          date: appt.date,
          title: 'Prescription Issued',
          subtitle: `By Dr. ${appt.doctor?.user?.name || 'Unknown'}`,
          description: appt.prescription,
          appointmentId: appt._id
        });
      }
    });

    prescriptions.forEach((rx) => {
      // Avoid duplicates if already added from appointment
      timelineEvents.push({
        id: rx._id,
        type: 'prescription_detailed',
        date: rx.createdAt,
        title: 'Prescription (Scanned/AI)',
        subtitle: `By Dr. ${rx.doctor?.user?.name || 'Unknown'}`,
        description: rx.rawText || '',
        medicines: rx.medicines || [],
        patientExplanation: rx.patientExplanation || ''
      });
    });

    // Sort all events by date descending
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: timelineEvents.length,
      data: timelineEvents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get medicine reminders for patient
// @route   GET /api/patients/reminders
// @access  Private (Patient)
// ======================================================
exports.getReminders = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const reminders = await MedicineReminder.find({ patient: patient._id, active: true })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Create medicine reminder
// @route   POST /api/patients/reminders
// @access  Private (Patient)
// ======================================================
exports.createReminder = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { medicine, dosage, frequency, times, duration, source } = req.body;
    if (!medicine) {
      return res.status(400).json({ success: false, error: 'Medicine name is required' });
    }

    const reminder = await MedicineReminder.create({
      patient: patient._id,
      medicine,
      dosage: dosage || '',
      frequency: frequency || '',
      times: times || [],
      duration: duration || '',
      source: source || 'manual'
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Bulk create reminders from OCR scan results
// @route   POST /api/patients/reminders/bulk
// @access  Private (Patient)
// ======================================================
exports.bulkCreateReminders = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { medicines } = req.body; // Array of medicine objects
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, error: 'Medicines array is required' });
    }

    const remindersToCreate = medicines.map(m => ({
      patient: patient._id,
      medicine: m.medicine || m.name,
      dosage: m.dosage || '',
      frequency: m.frequency || '',
      times: m.times || [],
      duration: m.duration || '',
      source: 'ocr'
    }));

    const created = await MedicineReminder.insertMany(remindersToCreate);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Delete/deactivate a reminder
// @route   DELETE /api/patients/reminders/:id
// @access  Private (Patient)
// ======================================================
exports.deleteReminder = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    const reminder = await MedicineReminder.findOne({ _id: req.params.id, patient: patient?._id });

    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    reminder.active = false;
    await reminder.save();

    res.status(200).json({ success: true, message: 'Reminder deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
