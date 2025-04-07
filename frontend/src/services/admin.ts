import axios from "axios";


const API_BASE_URL = 'http://65.0.106.97/api/admin';

// Dummy FetchCourses for milestone3 Submission
export const fetchCoursesAdmin = async () => {

  const response = await axios.get(`${API_BASE_URL}/courses`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  return response.data;
};
