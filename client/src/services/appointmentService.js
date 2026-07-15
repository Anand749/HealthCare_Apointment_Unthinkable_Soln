import API from './api';

export const holdSlot = async (doctorId, date, slot) => {
  const response = await API.post('/appointments/hold', { doctorId, date, slot });
  return response.data;
};

export const bookAppointment = async (doctorId, date, slot, symptoms) => {
  const response = await API.post('/appointments/book', { doctorId, date, slot, symptoms });
  return response.data;
};

export const getDoctorSchedule = async () => {
  const response = await API.get('/appointments/doctor');
  return response.data;
};

export const getPatientAppointments = async () => {
  const response = await API.get('/appointments/patient');
  return response.data;
};

export const updateConsultation = async (id, data) => {
  const response = await API.put(`/appointments/${id}/consult`, data);
  return response.data;
};
