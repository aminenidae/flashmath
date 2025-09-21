import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TeacherLogin from './TeacherLogin';
import StudentLogin from './StudentLogin';

const LoginPage = () => {
  const [userType, setUserType] = useState(''); // 'teacher' or 'student'
  const navigate = useNavigate();

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  const handleBackToSelection = () => {
    setUserType('');
  };

  if (userType === 'teacher') {
    return <TeacherLogin />;
  }

  if (userType === 'student') {
    return <StudentLogin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Flash Math</h1>
          <p className="text-gray-600 mt-2">Select your account type</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelect('teacher')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            Login as Teacher
          </button>

          <button
            onClick={() => handleUserTypeSelect('student')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Login as Student
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;