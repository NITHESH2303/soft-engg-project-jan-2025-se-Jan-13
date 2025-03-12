// services/student.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/student';


// Fetch courses for a student
export const fetchCourses = async () => {

  const response = await axios.get(`${API_BASE_URL}/course/current`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  return response.data;
};


// Fetch deadlines for a student
export const fetchDeadlines = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deadlines`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch deadlines');
  }
};

//Fetch student data
export const fetchStudentData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })

    return response.data;
  } catch (error){
    throw new Error('Failed to fetch student data')
  }
}

//Fetch student weekly course content
export const fetchCourseContent = async (courseId: string | undefined) => {
  try{
    const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    
    return response.data
  } catch (error){
    throw new Error('Failed to fetch course content')
  }
} 


//Fetch student weekly course content
export const fetchCourseDetails = async (courseId: string | undefined) => {
  try{
    const response = await axios.get(`${API_BASE_URL}/course/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    
    return response.data
  } catch (error){
    throw new Error('Failed to fetch course content')
  }
} 

//Post request to update profile
export const updateProfile = async () => {
  return
}
// Dummy FetchDeadlines for milestone3 Submission
// export const fetchDeadlines = async () => {
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 300));

//     // Dummy response
//     const dummyResponse = [
//       {
//         "id": 1,
//         "course_id": 1,
//         "assignment_no": 2,
//         "deadline": "20 February 2025",
//         "status": "Pending",
//         "course_title": "Business Data Management"
//       },
//       {
//         "id": 2,
//         "course_id": 2,
//         "assignment_no": 2,
//         "deadline": "20 February 2025",
//         "status": "Pending",
//         "course_title": "Business Analytics"
//       },
//       {
//         "id": 3,
//         "course_id": 3,
//         "assignment_no": 2,
//         "deadline": "20 February 2025",
//         "status": "Pending",
//         "course_title": "Modern Application Development - I"
//       }
//     ];

//     return dummyResponse;
//   } catch (error) {
//     throw new Error('Failed to fetch deadlines');
//   }
// };


// // TODO: Paste this in weeklyCourseContent.tsx

// // const fetchCourseContent = async () => {
// //   try {
// //     const response = await fetch(`http://127.0.0.1:8000/api/student/courses/${courseId}`);
// //     if (!response.ok) {
// //       throw new Error('Failed to fetch course content');
// //     }
// //     const data = await response.json();
// //     setCourseContent(data);
// //     if (data.weeks.length > 0 && data.weeks[0].videos.length > 0) {
// //       setSelectedContent({ type: 'video', id: data.weeks[0].videos[0].id });
// //     }
// //   } catch (error) {
// //     console.error('Error fetching course content:', error);
// //   }
// // };