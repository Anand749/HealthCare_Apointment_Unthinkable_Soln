const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const SlotReservation = require('../models/SlotReservation');

// @desc    Get all doctors with their available slots
// @route   GET /api/doctors
// @access  Private (Patient)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email role gender');
    
    // For each doctor, construct slots (Mocked generation based on working hours, filtering booked/held ones)
    const doctorsWithSlots = await Promise.all(doctors.map(async (doc) => {
      // Default slots
      const defaultSlots = ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM'];
      
      // Get today's date boundary
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Find booked appointments for this doctor today
      const bookedAppointments = await Appointment.find({
        doctor: doc._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'completed'] }
      });
      
      const bookedSlots = bookedAppointments.map(a => a.slot);
      
      // Find held slots for this doctor today
      const heldSlotsData = await SlotReservation.find({
        doctor: doc._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const heldSlots = heldSlotsData.map(h => h.slot);

      // Filter available slots
      const availableSlots = defaultSlots.filter(s => !bookedSlots.includes(s) && !heldSlots.includes(s));

      return {
        id: doc._id,
        name: doc.user?.name || 'Unknown Doctor',
        spec: doc.specialization,
        exp: doc.experience,
        rating: doc.rating,
        consultations: doc.consultations,
        slotsToday: availableSlots,
        emoji: doc.user?.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'
      };
    }));

    res.status(200).json({ success: true, data: doctorsWithSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
