import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const mockUsers = {
  patient: {
    id: 'p1',
    name: 'Alex Mercer',
    email: 'patient@healthcare.com',
    role: 'patient',
    token: 'mock-patient-token',
    healthScore: 87,
    metrics: {
      bloodPressure: '122/80',
      bloodPressureStatus: 'Slight Increase',
      weight: '72 kg',
      weightStatus: 'Improving',
      sugar: '95 mg/dL',
      sugarStatus: 'Stable',
      adherence: 95
    }
  },
  doctor: {
    id: 'd1',
    name: 'Dr. Sarah Connor',
    email: 'doctor@healthcare.com',
    role: 'doctor',
    token: 'mock-doctor-token',
    specialization: 'Cardiologist',
    experience: 15,
    rating: 4.9,
    hospital: 'Metro Cardiac Center'
  },
  admin: {
    id: 'a1',
    name: 'Chief Admin Office',
    email: 'admin@healthcare.com',
    role: 'admin',
    token: 'mock-admin-token'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      // 1. Try real login against Express backend
      const response = await API.post('/auth/login', { email, password });
      if (response.data?.success) {
        const payload = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          token: response.data.token
        };
        setUser(payload);
        localStorage.setItem('hc_user', JSON.stringify(payload));
        setLoading(false);
        return payload;
      }
    } catch (error) {
      console.warn('Backend offline or authentication failed. Falling back to mock data.', error.message);
    }

    // 2. Fallback Mock Logins for testing when node server is offline
    await new Promise((resolve) => setTimeout(resolve, 800));
    const selectedUser = Object.values(mockUsers).find(
      (u) => (u.email === email && role === u.role) || (role === u.role)
    );

    if (selectedUser) {
      setUser(selectedUser);
      localStorage.setItem('hc_user', JSON.stringify(selectedUser));
      setLoading(false);
      return selectedUser;
    } else {
      setLoading(false);
      throw new Error('Invalid credentials');
    }
  };

  const registerPatient = async (data) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.warn('Backend offline, simulating successful registration.');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerPatient, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
