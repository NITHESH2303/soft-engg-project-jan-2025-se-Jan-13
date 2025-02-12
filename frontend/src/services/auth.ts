import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// Login function
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Signup function
export const signup = async (username: string, email: string, password: string, role: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      username,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error('Signup failed. Please try again.');
  }
};