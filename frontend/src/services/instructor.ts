// services/instructor.ts
import axios from 'axios';

const API_BASE_URL = 'http://65.0.106.97/api';

// Fetch courses for an instructor
export const fetchCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/instructor/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};

// Fetch pending assignments posted by TAs
export const fetchPendingAssignments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/instructor/pending-assignments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pending assignments');
  }
};

// Add new course content
export const addCourseContent = async (courseId: number, contentData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/instructor/courses/${courseId}/content`, contentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add course content');
  }
};

// Update assignment status (approve or reject)
export const updateAssignmentStatus = async (assignmentId: number, status: 'approved' | 'rejected') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/instructor/assignments/${assignmentId}`, 
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
