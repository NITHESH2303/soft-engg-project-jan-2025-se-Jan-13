import { Route, BrowserRouter, Routes } from "react-router-dom";
import Signup from './components/pages/Signup'
import Chat from './components/pages/Chat'
import Performance from './components/pages/Performance'
import CourseAssignment from './components/pages/CourseAssignment'
import CourseAnalytics from './components/pages/CourseAnalytics'
import Profile from './components/pages/Profile'
import InstructorLogin from "./components/pages/InstructorLogin";
import TALogin from "./components/pages/TaLogin";
import TADashboard from "./components/pages/TaDashboard";
import CustomizeAI from "./components/pages/CustomizeAI";
import AddContent from "./components/AiAgent/AddContent";
import ManageCourse from "./components/ManageCourse/ManageCourseTA";
import StudentDashboard from "./components/Student/StudentDashboard";
import Login from "./components/Student/Login";
import StudentCoursePage from "./components/Student/StudentCoursePage";
import WeeklyCourseContent from "./components/WeeklyCourseContent/WeeklyCourseContent";
import AdminDashboard from "./components/pages/AdminDashboard";
import StudentStats from "./components/Admin/StudentStats";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* TODO: Check if user is already logged in and if so redirect him to currsponding dashboard 
          based on the role*/}

          {/* Student Routes */}
          <Route path="/student/dashboard" Component={StudentDashboard} />
          <Route path="/student/course/:courseId" Component={StudentCoursePage} />
          <Route path="/student/course/:courseId" Component={WeeklyCourseContent} />
          <Route path="/student/profile" Component={Profile} />
          <Route path="/" Component={Login} />
          <Route path="/signup" Component={Signup} />
          <Route path="/login" Component={Login} />
          <Route path="/student/performance" Component={Performance} />

          {/* TA Routes */}``
          <Route path="/ta/dashboard" Component={TADashboard} />
          <Route path="/ta/login" Component={TALogin} />
          <Route path="/ta/manage-course/:courseId" Component={ManageCourse} />
          <Route path="/ta/students" Component={StudentStats} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" Component={AdminDashboard} />
          <Route path="/admin/manage-course/:courseId" Component={ManageCourse} />
          <Route path="/admin/customize-ai" Component={CustomizeAI} />
          <Route path="/admin/add-content" Component={AddContent} />
          <Route path="/admin/login" Component={InstructorLogin} />
          <Route path="/admin/students" Component={StudentStats} />

          {/* Common Routes */}
          <Route path="/chat" Component={Chat} />
          <Route path="/course/:courseId/assignment/:weekId" Component={CourseAssignment} />
          <Route path="/course/:courseId/analytics" Component={CourseAnalytics} />
          
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App