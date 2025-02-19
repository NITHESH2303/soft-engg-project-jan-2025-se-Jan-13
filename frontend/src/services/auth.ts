import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// Login function
export const loginActual = async (username: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Dummy login for milestone3 Submission
export const login = async (username: string, password: string) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dummy response
    const dummyResponse = {
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYW5rYWoiLCJyb2xlIjoic3R1ZGVudCIsImV4cCI6MTczOTk1ODY3NX0.1l6iZVz4vhlaIY4UOflJfeyzg5FjAqnuYPcnyEVvrnY",
      token_type: "bearer"
    };

    return dummyResponse;
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