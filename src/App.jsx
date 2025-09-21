import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import TeacherDashboard from './components/TeacherDashboard'
import StudentInterface from './components/StudentInterface'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'teacher' or 'student'

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage setUser={setUser} setUserRole={setUserRole} />,
    },
    {
      path: "/teacher",
      element: <TeacherDashboard user={user} />,
    },
    {
      path: "/student",
      element: <StudentInterface user={user} />,
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <RouterProvider router={router} />
    </div>
  )
}

export default App