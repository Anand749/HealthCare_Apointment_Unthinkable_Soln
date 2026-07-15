import API from './api';

// ── Hold a slot (5-min reservation) ──────────────────────────
export const holdSlot = async (doctorId, date, slot) => {
  const response = await API.post('/appointments/hold', { doctorId, date, slot });
  return response.data;
};

// ── Book appointment (requires active hold) ───────────────────
export const bookAppointment = async ({ doctorId, date, slot, symptoms }) => {
  const response = await API.post('/appointments/book', { doctorId, date, slot, symptoms });
  return response.data;
};

// ── Patient: get own appointments ─────────────────────────────
export const getPatientAppointments = async (params = {}) => {
  const response = await API.get('/appointments/patient', { params });
  return response.data;
};

// ── Doctor: get own schedule ──────────────────────────────────
export const getDoctorSchedule = async (params = {}) => {
  const response = await API.get('/appointments/doctor', { params });
  return response.data;
};

// ── Doctor: accept or reject appointment ─────────────────────
export const updateAppointmentStatus = async (appointmentId, status) => {
  const response = await API.patch(`/appointments/${appointmentId}/status`, { status });
  return response.data;
};

// ── Doctor: write consultation notes ─────────────────────────
export const updateConsultation = async (appointmentId, data) => {
  const response = await API.put(`/appointments/${appointmentId}/consult`, data);
  return response.data;
};

// ── Admin: get all appointments ───────────────────────────────
export const getAllAppointments = async (params = {}) => {
  const response = await API.get('/appointments/all', { params });
  return response.data;
};
