const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const SlotReservation = require('../models/SlotReservation');

// ======================================================
// @desc    Get all doctors with available slots (Patient/Doctor/Admin)
// @route   GET /api/doctors
// @access  Private (All authenticated)
// ======================================================
exports.getAllDoctors = async (req, res) => {
  try {
    const filter = { isActive: { $ne: false } };

    // Filter by specialization
    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, 'i');
    }
    // Filter by min experience
    if (req.query.minExperience) {
      filter.experience = { $gte: parseInt(req.query.minExperience) };
    }
    // Filter by min rating
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }
    // Search by name (via populate — we need a different approach)
    const doctors = await Doctor.find(filter)
      .populate('user', 'name email gender')
      .sort({ rating: -1, experience: -1 });

    // Apply name search after population
    let filteredDoctors = doctors;
    if (req.query.search) {
      const searchLower = req.query.search.toLowerCase();
      filteredDoctors = doctors.filter(d =>
        d.user?.name?.toLowerCase().includes(searchLower) ||
        d.specialization?.toLowerCase().includes(searchLower) ||
        d.hospital?.toLowerCase().includes(searchLower)
      );
    }

    // Build slot availability for today
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

    const doctorsWithSlots = await Promise.all(filteredDoctors.map(async (doc) => {
      const defaultSlots = doc.availableSlots && doc.availableSlots.length > 0
        ? doc.availableSlots
        : ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'];

      // Get today's booked slots
      const bookedAppointments = await Appointment.find({
        doctor: doc._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'completed'] }
      }).select('slot');

      const bookedSlots = bookedAppointments.map(a => a.slot);

      // Get currently held slots (not expired)
      const heldSlotsData = await SlotReservation.find({
        doctor: doc._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        expiresAt: { $gte: new Date() }
      }).select('slot');

      const heldSlots = heldSlotsData.map(h => h.slot);
      const availableTodaySlots = defaultSlots.filter(s => !bookedSlots.includes(s) && !heldSlots.includes(s));

      return {
        id: doc._id,
        name: doc.user?.name || 'Unknown Doctor',
        email: doc.user?.email || '',
        gender: doc.user?.gender || '',
        specialization: doc.specialization,
        department: doc.department || '',
        experience: doc.experience,
        rating: doc.rating,
        consultations: doc.consultations,
        hospital: doc.hospital || '',
        bio: doc.bio || '',
        profileImage: doc.profileImage || '',
        languages: doc.languages || ['English'],
        workingHours: doc.workingHours,
        availableSlots: defaultSlots,
        slotsAvailableToday: availableTodaySlots,
        isAvailableToday: availableTodaySlots.length > 0
      };
    }));

    // Filter available today if requested
    let result = doctorsWithSlots;
    if (req.query.availableToday === 'true') {
      result = doctorsWithSlots.filter(d => d.isAvailableToday);
    }

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Private (All authenticated)
// ======================================================
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email gender');
    if (!doctor || doctor.isActive === false) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Get available slots for next 7 days
    const upcomingSlots = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

      const bookedSlots = (await Appointment.find({
        doctor: doctor._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'completed'] }
      }).select('slot')).map(a => a.slot);

      const heldSlots = (await SlotReservation.find({
        doctor: doctor._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        expiresAt: { $gte: new Date() }
      }).select('slot')).map(h => h.slot);

      const allSlots = doctor.availableSlots && doctor.availableSlots.length > 0
        ? doctor.availableSlots
        : ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'];

      const dateKey = startOfDay.toISOString().split('T')[0];
      upcomingSlots[dateKey] = allSlots.map(slot => ({
        slot,
        available: !bookedSlots.includes(slot) && !heldSlots.includes(slot)
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        name: doctor.user?.name,
        email: doctor.user?.email,
        gender: doctor.user?.gender,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        rating: doctor.rating,
        consultations: doctor.consultations,
        hospital: doctor.hospital,
        bio: doctor.bio,
        profileImage: doctor.profileImage,
        languages: doctor.languages,
        workingHours: doctor.workingHours,
        upcomingSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get logged-in doctor's own profile
// @route   GET /api/doctors/profile/me
// @access  Private (Doctor)
// ======================================================
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email gender');
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    // Today's appointment count
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);
    const todayCount = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'completed'] }
    });

    // Total pending
    const pendingCount = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        name: doctor.user?.name,
        email: doctor.user?.email,
        gender: doctor.user?.gender,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        rating: doctor.rating,
        consultations: doctor.consultations,
        hospital: doctor.hospital,
        bio: doctor.bio,
        languages: doctor.languages,
        workingHours: doctor.workingHours,
        availableSlots: doctor.availableSlots,
        stats: {
          todayAppointments: todayCount,
          pendingAppointments: pendingCount,
          totalConsultations: doctor.consultations
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Update doctor availability/working hours
// @route   PUT /api/doctors/profile/availability
// @access  Private (Doctor)
// ======================================================
exports.updateDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const { workingHours, availableSlots, bio, hospital, languages } = req.body;

    if (workingHours) doctor.workingHours = workingHours;
    if (availableSlots && Array.isArray(availableSlots)) doctor.availableSlots = availableSlots;
    if (bio !== undefined) doctor.bio = bio;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (languages) doctor.languages = languages;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Private (All authenticated)
// ======================================================
exports.getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = (await Appointment.find({
      doctor: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'completed'] }
    }).select('slot')).map(a => a.slot);

    const heldSlots = (await SlotReservation.find({
      doctor: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      expiresAt: { $gte: new Date() }
    }).select('slot')).map(h => h.slot);

    const allSlots = doctor.availableSlots && doctor.availableSlots.length > 0
      ? doctor.availableSlots
      : ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'];

    const slots = allSlots.map(slot => ({
      slot,
      available: !bookedSlots.includes(slot) && !heldSlots.includes(slot),
      held: heldSlots.includes(slot),
      booked: bookedSlots.includes(slot)
    }));

    res.status(200).json({ success: true, date, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
