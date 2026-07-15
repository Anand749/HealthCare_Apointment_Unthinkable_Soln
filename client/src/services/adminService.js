import API from './api';

// ── Analytics ─────────────────────────────────────────────────
export const getAnalytics = async () => {
  const response = await API.get('/admin/analytics');
  return response.data;
};

// ── Doctor CRUD ───────────────────────────────────────────────
export const addDoctor = async (data) => {
  const response = await API.post('/admin/doctors', data);
  return response.data;
};

export const getAllDoctors = async (params = {}) => {
  const response = await API.get('/admin/doctors', { params });
  return response.data;
};

export const updateDoctor = async (id, data) => {
  const response = await API.put(`/admin/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id) => {
  const response = await API.delete(`/admin/doctors/${id}`);
  return response.data;
};

// ── Patient management ────────────────────────────────────────
export const getAllPatients = async (params = {}) => {
  const response = await API.get('/admin/patients', { params });
  return response.data;
};

// ── Appointments (admin view) ─────────────────────────────────
export const getAllAppointments = async (params = {}) => {
  const response = await API.get('/admin/appointments', { params });
  return response.data;
};

// ── Notification/email logs ───────────────────────────────────
export const getNotificationLogs = async (params = {}) => {
  const response = await API.get('/admin/notifications', { params });
  return response.data;
};

// ── Leaves ────────────────────────────────────────────────────
export const getLeaves = async () => {
  const response = await API.get('/leaves');
  return response.data;
};

export const cancelLeave = async (id) => {
  const response = await API.delete(`/leaves/${id}`);
  return response.data;
};

