import API from './api';

export const getAllDoctors = async () => {
  const response = await API.get('/doctors');
  return response.data;
};
