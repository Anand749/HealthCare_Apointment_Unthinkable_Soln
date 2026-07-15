const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Prescription = require('../models/Prescription');

// ======================================================
// @desc    Add a new doctor (create User + Doctor profile)
// @route   POST /api/admin/doctors
// @access  Private (Admin)
// ======================================================
exports.addDoctor = async (req, res) => {
  try {
    const {
      name, email, password, gender,
      specialization, department, experience,
      hospital, bio, languages, workingHours, availableSlots, rating
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    // Create User account
    const user = await User.create({
      name,
      email,
      password: password || 'Doctor@123',
      role: 'doctor',
      gender: gender || 'male'
    });

    // Create Doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      department: department || '',
      experience: experience || 0,
      hospital: hospital || '',
      bio: bio || '',
      languages: languages || ['English'],
      workingHours: workingHours || { start: '09:00 AM', end: '05:00 PM' },
      availableSlots: availableSlots || ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'],
      rating: rating || 5.0
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: {
        userId: user._id,
        doctorId: doctor._id,
        name: user.name,
        email: user.email,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get all doctors (admin view with full details)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
// ======================================================
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, 'i');
    }

    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter)
      .populate('user', 'name email gender createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Enrich with appointment counts
    const enriched = await Promise.all(doctors.map(async (doc) => {
      const apptCount = await Appointment.countDocuments({ doctor: doc._id });
      return {
        _id: doc._id,
        userId: doc.user?._id,
        name: doc.user?.name,
        email: doc.user?.email,
        gender: doc.user?.gender,
        specialization: doc.specialization,
        department: doc.department,
        experience: doc.experience,
        rating: doc.rating,
        consultations: doc.consultations,
        hospital: doc.hospital,
        bio: doc.bio,
        languages: doc.languages,
        workingHours: doc.workingHours,
        availableSlots: doc.availableSlots,
        isActive: doc.isActive,
        totalAppointments: apptCount,
        joinedAt: doc.user?.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Update doctor profile (admin)
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin)
// ======================================================
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const {
      specialization, department, experience, hospital,
      bio, languages, workingHours, availableSlots, rating, isActive, name
    } = req.body;

    // Update doctor fields
    if (specialization) doctor.specialization = specialization;
    if (department !== undefined) doctor.department = department;
    if (experience !== undefined) doctor.experience = experience;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (bio !== undefined) doctor.bio = bio;
    if (languages) doctor.languages = languages;
    if (workingHours) doctor.workingHours = workingHours;
    if (availableSlots) doctor.availableSlots = availableSlots;
    if (rating !== undefined) doctor.rating = rating;
    if (isActive !== undefined) doctor.isActive = isActive;

    await doctor.save();

    // Update user name if provided
    if (name) {
      await User.findByIdAndUpdate(doctor.user, { name });
    }

    const updated = await Doctor.findById(req.params.id).populate('user', 'name email');
    res.status(200).json({ success: true, message: 'Doctor updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Delete a doctor (admin)
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin)
// ======================================================
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Cancel any future appointments
    await Appointment.updateMany(
      { doctor: doctor._id, status: 'scheduled', date: { $gte: new Date() } },
      { $set: { status: 'cancelled' } }
    );

    // Soft delete: mark inactive instead of destroying records
    doctor.isActive = false;
    await doctor.save();

    // Also deactivate user account (don't delete to preserve history)
    await User.findByIdAndUpdate(doctor.user, { role: 'deactivated' });

    res.status(200).json({ success: true, message: 'Doctor deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get all patients (admin)
// @route   GET /api/admin/patients
// @access  Private (Admin)
// ======================================================
exports.getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Patient.countDocuments();
    const patients = await Patient.find()
      .populate('user', 'name email createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(patients.map(async (p) => {
      const apptCount = await Appointment.countDocuments({ patient: p._id });
      return {
        _id: p._id,
        name: p.user?.name,
        email: p.user?.email,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        dob: p.dob,
        totalAppointments: apptCount,
        joinedAt: p.user?.createdAt
      };
    }));

    res.status(200).json({ success: true, total, page, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
// ======================================================
exports.getAnalytics = async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, totalNotifications] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Notification.countDocuments()
    ]);

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Last 7 days appointment trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Appointments by specialization (via doctor lookup)
    const bySpecialization = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorData'
        }
      },
      { $unwind: { path: '$doctorData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$doctorData.specialization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Patient growth (monthly)
    const patientGrowth = await Patient.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$userData.createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Top performing doctors
    const topDoctors = await Doctor.find()
      .populate('user', 'name')
      .sort({ consultations: -1, rating: -1 })
      .limit(5);

    const topDoctorsList = topDoctors.map(d => ({
      name: d.user?.name || 'Unknown',
      specialization: d.specialization,
      consultations: d.consultations,
      rating: d.rating
    }));

    // Dummy revenue (for display purposes)
    const revenueEstimate = totalAppointments * 500; // ₹500 per appointment (mock)

    res.status(200).json({
      success: true,
      data: {
        totals: {
          doctors: totalDoctors,
          patients: totalPatients,
          appointments: totalAppointments,
          notifications: totalNotifications,
          revenue: revenueEstimate
        },
        appointmentsByStatus: appointmentsByStatus.map(s => ({ status: s._id, count: s.count })),
        dailyTrend: dailyTrend.map(d => ({ date: d._id, count: d.count })),
        bySpecialization: bySpecialization.map(s => ({ name: s._id || 'Unknown', value: s.count })),
        patientGrowth: patientGrowth.map(p => ({ month: p._id, patients: p.count })),
        topDoctors: topDoctorsList
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get notification logs (email retry history)
// @route   GET /api/admin/notifications
// @access  Private (Admin)
// ======================================================
exports.getNotificationLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const total = await Notification.countDocuments(filter);
    const logs = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, page, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
