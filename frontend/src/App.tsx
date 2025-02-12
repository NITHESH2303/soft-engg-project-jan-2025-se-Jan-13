import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from './components/pages/Login'
import Signup from './components/pages/Signup'
import Chat from './components/pages/Chat'
import Dashboard from './components/pages/Dashboard'
import Performance from './components/pages/Performance'
import CourseVideos from './components/pages/CourseVideos'
import CourseAssignment from './components/pages/CourseAssignment'
import CourseAnalytics from './components/pages/CourseAnalytics'
import Profile from './components/pages/Profile'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={Login} />
          <Route path="/signup" Component={Signup} />
          <Route path="/chat" Component={Chat} />
          <Route path="/dashboard" Component={Dashboard} />
          <Route path="/performance" Component={Performance} />
          <Route path="/course/:courseId" Component={CourseVideos} />
          <Route path="/course/:courseId/assignment/:weekId" Component={CourseAssignment} />
          <Route path="/course/:courseId/analytics" Component={CourseAnalytics} />
          <Route path="/profile" Component={Profile} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App