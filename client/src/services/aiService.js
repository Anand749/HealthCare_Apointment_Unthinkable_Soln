import API from './api';

export const triageSymptoms = async (symptoms) => {
  const response = await API.post('/ai/triage', { symptoms });
  return response.data;
};

export const getRecommendations = async (symptoms) => {
  const response = await API.post('/ai/recommendations', { symptoms });
  return response.data;
};

export const getHealthInsights = async () => {
  const response = await API.get('/ai/insights');
  return response.data;
};

export const scanPrescription = async (formData) => {
  const response = await API.post('/ai/ocr-scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const generateExplanation = async (notes, prescription) => {
  const response = await API.post('/ai/explanation', { notes, prescription });
  return response.data;
};
