// services/student.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fetch courses for a student
export const fetchCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/student/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};

// Fetch deadlines for a student
export const fetchDeadlines = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/student/deadlines`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch deadlines');
  }
};