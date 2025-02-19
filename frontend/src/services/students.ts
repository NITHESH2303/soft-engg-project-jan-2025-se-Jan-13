// services/student.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fetch courses for a student
export const fetchCoursesActual = async () => {
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

// Dummy FetchCourses for milestone3 Submission
export const fetchCourses = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Dummy response
    const dummyResponse = [
      {
        "id": 1,
        "title": "Business Data Management",
        "category": "Data Science",
        "icon": "📊",
        "description": "Learn to manage and analyze business data effectively"
      },
      {
        "id": 2,
        "title": "Business Analytics",
        "category": "Data Science",
        "icon": "📈",
        "description": "Master the fundamentals of business analytics"
      },
      {
        "id": 3,
        "title": "Modern Application Development - I",
        "category": "Programming",
        "icon": "💻",
        "description": "Build modern web applications using React"
      }
    ];

    return dummyResponse;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};


// Fetch deadlines for a student
export const fetchDeadlinesActual = async () => {
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

// Dummy FetchDeadlines for milestone3 Submission
export const fetchDeadlines = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Dummy response
    const dummyResponse = [
      {
        "id": 1,
        "course_id": 1,
        "assignment_no": 2,
        "deadline": "20 February 2025",
        "status": "Pending",
        "course_title": "Business Data Management"
      },
      {
        "id": 2,
        "course_id": 2,
        "assignment_no": 2,
        "deadline": "20 February 2025",
        "status": "Pending",
        "course_title": "Business Analytics"
      },
      {
        "id": 3,
        "course_id": 3,
        "assignment_no": 2,
        "deadline": "20 February 2025",
        "status": "Pending",
        "course_title": "Modern Application Development - I"
      }
    ];

    return dummyResponse;
  } catch (error) {
    throw new Error('Failed to fetch deadlines');
  }
};


// TODO: Paste this in weeklyCourseContent.tsx

// const fetchCourseContent = async () => {
//   try {
//     const response = await fetch(`http://127.0.0.1:8000/api/student/courses/${courseId}`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch course content');
//     }
//     const data = await response.json();
//     setCourseContent(data);
//     if (data.weeks.length > 0 && data.weeks[0].videos.length > 0) {
//       setSelectedContent({ type: 'video', id: data.weeks[0].videos[0].id });
//     }
//   } catch (error) {
//     console.error('Error fetching course content:', error);
//   }
// };