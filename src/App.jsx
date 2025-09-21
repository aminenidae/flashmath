import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import TeacherDashboard from './components/TeacherDashboard'
import StudentInterface from './components/StudentInterface'
import './App.css'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/teacher",
      element: (
        <ProtectedRoute requiredRole="teacher">
          <TeacherDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/student",
      element: (
        <ProtectedRoute requiredRole="student">
          <StudentInterface />
        </ProtectedRoute>
      ),
    },
  ])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App