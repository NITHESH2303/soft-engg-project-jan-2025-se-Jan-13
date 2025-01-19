import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from './components/pages/Login'
import Signup from './components/pages/Signup'
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/signup" Component={Signup} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
