import API from './api';

// ── Patient profile ───────────────────────────────────────────
export const getPatientProfile = async () => {
  const response = await API.get('/patients/profile');
  return response.data;
};

// ── Update health metrics (BP, weight, glucose) ───────────────
export const updateHealthMetrics = async (data) => {
  // data: { bloodPressure: {systolic, diastolic}, weight, glucose }
  const response = await API.put('/patients/metrics', data);
  return response.data;
};

// ── Health timeline (sorted appointments + prescriptions) ─────
export const getHealthTimeline = async () => {
  const response = await API.get('/patients/timeline');
  return response.data;
};

// ── Medicine reminders ────────────────────────────────────────
export const getReminders = async () => {
  const response = await API.get('/patients/reminders');
  return response.data;
};

export const createReminder = async (data) => {
  const response = await API.post('/patients/reminders', data);
  return response.data;
};

// ── Bulk create reminders from OCR scan results ───────────────
export const bulkCreateReminders = async (medicines) => {
  const response = await API.post('/patients/reminders/bulk', { medicines });
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await API.delete(`/patients/reminders/${id}`);
  return response.data;
};
