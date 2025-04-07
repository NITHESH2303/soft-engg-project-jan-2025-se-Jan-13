import axios from 'axios';

const API_BASE_URL = 'https://65.0.106.97:8000/api';

// Login function
export const loginActual = async (username: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
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
// export const login = async (username: string, password: string) => {
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));

//     // Dummy response
//     const dummyResponse = {
//       access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYW5rYWoiLCJyb2xlIjoic3R1ZGVudCIsImV4cCI6MTczOTk1ODY3NX0.1l6iZVz4vhlaIY4UOflJfeyzg5FjAqnuYPcnyEVvrnY",
//       token_type: "bearer"
//     };

//     return dummyResponse;
//   } catch (error) {
//     throw new Error('Login failed. Please check your credentials.');
//   }
// };

// Signup function
export const signup = async ({
  username,
  email,
  password,
  role,
  first_name,
  last_name,
  selectedCourses
}: {
  username: string,
  email: string,
  password: string,
  role: string,
  first_name: string,
  last_name: string,
  selectedCourses: number[]
}) => {
  try {
    // Step 1: User signup
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      username,
      email,
      password,
      role,
    });

    if (signupResponse.status === 200) {
      const accessToken = signupResponse.data.access_token;

      // Step 2: Register student details
      await axios.post(`${API_BASE_URL}/student/student-profile`, {
        first_name,
        middle_name: '',
        last_name,
        email_id: email
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Step 3: Enroll in selected courses
      if (selectedCourses.length > 0) {
        await axios.post(`${API_BASE_URL}/student/register-courses`, {
          course_ids: selectedCourses
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }

      return signupResponse.data;
    } else {
      throw new Error('Signup failed. Please try again.');
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error('Signup failed. Please try again.');
  }
};