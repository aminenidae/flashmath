import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ExerciseList from './ExerciseList';
import FlashMode from './FlashMode';

const StudentInterface = () => {
  const [activeView, setActiveView] = useState('exercises'); // 'exercises' or 'flash'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { currentUser, studentData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Navigation is now handled by ProtectedRoute
    // This component will only render if authenticated as student
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setActiveView('flash');
  };

  const exitFlashMode = () => {
    setActiveView('exercises');
    setSelectedExercise(null);
  };

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-white text-xl">Loading student data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flash Math</h1>
            <p className="text-gray-600">Welcome, {studentData.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{studentData.name}</p>
              <p className="text-sm text-gray-500">{studentData.classroom} Level</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'exercises' && (
          <ExerciseList
            classroom={studentData.classroom}
            onStartExercise={startExercise}
          />
        )}

        {activeView === 'flash' && selectedExercise && (
          <FlashMode
            exercise={selectedExercise}
            onExit={exitFlashMode}
          />
        )}
      </main>
    </div>
  );
};

export default StudentInterface;