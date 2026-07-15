import API from './api';

// ── Doctor list with filters ───────────────────────────────────
export const getAllDoctors = async (params = {}) => {
  const response = await API.get('/doctors', { params });
  return response.data;
};

// ── Single doctor profile ──────────────────────────────────────
export const getDoctorById = async (id) => {
  const response = await API.get(`/doctors/${id}`);
  return response.data;
};

// ── Slot availability for a specific date ─────────────────────
export const getDoctorSlots = async (doctorId, date) => {
  const response = await API.get(`/doctors/${doctorId}/slots`, { params: { date } });
  return response.data;
};

// ── Doctor's own profile ──────────────────────────────────────
export const getDoctorProfile = async () => {
  const response = await API.get('/doctors/profile/me');
  return response.data;
};

// ── Update doctor availability ────────────────────────────────
export const updateDoctorAvailability = async (data) => {
  const response = await API.put('/doctors/profile/availability', data);
  return response.data;
};
