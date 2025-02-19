import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from './components/pages/Login'
import Signup from './components/pages/Signup'
import Chat from './components/pages/Chat'
import Dashboard from './components/pages/Dashboard'
import Performance from './components/pages/Performance'
import CourseAssignment from './components/pages/CourseAssignment'
import CourseAnalytics from './components/pages/CourseAnalytics'
import Profile from './components/pages/Profile'
import InstructorLogin from "./components/pages/InstructorLogin";
import TALogin from "./components/pages/TaLogin";
import TADashboard from "./components/pages/TaDashboard";
import InstructorDashboard from "./components/pages/InstructorDashboard";
import CustomizeAI from "./components/pages/CustomizeAI";
import AddContent from "./components/AiAgent/AddContent";
import ManageCourse from "./components/ManageCourse/ManageCourseTA";
import WeeklyCourseContent from "./components/pages/WeeklyCourseContent";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* TODO: Check if user is already logged in and if so redirect him to currsponding dashboard 
          based on the role*/}
          <Route path="/" Component={Login} />
          <Route path="/login" Component={Login} />
          <Route path="/instructor/login" Component={InstructorLogin} />
          <Route path="/ta/login" Component={TALogin} />
          <Route path="/signup" Component={Signup} />
          <Route path="/chat" Component={Chat} />
          <Route path="/dashboard" Component={Dashboard} />
          <Route path="/ta/dashboard" Component={TADashboard} />
          <Route path="/instructor/dashboard" Component={InstructorDashboard} />
          <Route path="/admin/customize-ai" Component={CustomizeAI} />
          <Route path="/admin/add-content" Component={AddContent} />
          <Route path="/performance" Component={Performance} />
          <Route path="/ta/manage-course/:courseId" Component={ManageCourse} />
          <Route path="/course/:courseId" Component={WeeklyCourseContent} />
          <Route path="/course/:courseId/assignment/:weekId" Component={CourseAssignment} />
          <Route path="/course/:courseId/analytics" Component={CourseAnalytics} />
          <Route path="/profile" Component={Profile} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App