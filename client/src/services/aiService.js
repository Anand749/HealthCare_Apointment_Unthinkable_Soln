import API from './api';

// ── Emergency Risk Triage ─────────────────────────────────────
export const triageSymptoms = async (symptoms) => {
  const response = await API.post('/ai/triage', { symptoms });
  return response.data;
};

// ── Smart Doctor Recommendations ──────────────────────────────
export const getRecommendations = async (symptoms) => {
  const response = await API.post('/ai/recommendations', { symptoms });
  return response.data;
};

// ── AI Health Insights ────────────────────────────────────────
export const getHealthInsights = async () => {
  const response = await API.get('/ai/insights');
  return response.data;
};

// ── OCR Prescription Scanner ──────────────────────────────────
export const scanPrescription = async (formData) => {
  const response = await API.post('/ai/ocr-scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// ── Patient-friendly Explanation (Doctor use) ─────────────────
export const generateExplanation = async (notes, prescription, diagnosis) => {
  const response = await API.post('/ai/explanation', { notes, prescription, diagnosis });
  return response.data;
};

// ── Symptom Summary for Doctor (before appointment) ───────────
export const generateSymptomSummary = async (symptoms, patientAge, patientGender, medicalHistory) => {
  const response = await API.post('/ai/symptom-summary', {
    symptoms,
    patientAge,
    patientGender,
    medicalHistory
  });
  return response.data;
};
