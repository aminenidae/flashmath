import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import TeacherDashboard from './components/TeacherDashboard'
import StudentInterface from './components/StudentInterface'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'teacher' or 'student'

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} setUserRole={setUserRole} />} />
          <Route path="/teacher" element={<TeacherDashboard user={user} />} />
          <Route path="/student" element={<StudentInterface user={user} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App