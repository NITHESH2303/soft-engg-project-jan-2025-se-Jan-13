// services/ta.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fetch courses for a TA
export const fetchCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ta/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};

// Fetch assignments for a TA
export const fetchAssignments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ta/assignments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch assignments');
  }
};

// Add a new assignment
export const addAssignment = async (assignmentData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ta/assignments`, assignmentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add assignment');
  }
};

// Update assignment status (e.g., mark as graded)
export const updateAssignmentStatus = async (assignmentId: number, status: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/ta/assignments/${assignmentId}`, 
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to update assignment status');
  }
};
