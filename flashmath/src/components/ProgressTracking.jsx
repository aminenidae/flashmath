import { useState, useEffect } from 'react';
import { getStudents, getProgressByStudent } from '../utils/firebaseUtils';

const ProgressTracking = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentData = await getStudents();
      setStudents(studentData);
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    setProgressData([]);
    
    if (studentId) {
      try {
        setLoading(true);
        const progress = await getProgressByStudent(studentId);
        
        // Process progress data for display
        const processedData = progress.map(item => ({
          studentId: item.studentId,
          studentName: students.find(s => s.id === item.studentId)?.name || 'Unknown',
          level: item.level,
          exerciseGroup: item.exerciseGroup,
          correct: item.isCorrect ? 1 : 0,
          total: 1,
          percentage: item.isCorrect ? 100 : 0
        }));
        
        // Group by exercise group and calculate averages
        const groupedData = processedData.reduce((acc, item) => {
          if (!acc[item.exerciseGroup]) {
            acc[item.exerciseGroup] = {
              ...item,
              correct: 0,
              total: 0,
              percentage: 0
            };
          }
          acc[item.exerciseGroup].correct += item.correct;
          acc[item.exerciseGroup].total += item.total;
          return acc;
        }, {});
        
        // Calculate percentages
        const finalData = Object.values(groupedData).map(item => ({
          ...item,
          percentage: Math.round((item.correct / item.total) * 100)
        }));
        
        setProgressData(finalData);
      } catch (err) {
        setError('Failed to fetch progress: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Tracking</h2>
        
        {/* Student Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Student</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                id="student"
                value={selectedStudent}
                onChange={handleStudentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.classroom})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Progress Data */}
        {selectedStudent && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Progress for {students.find(s => s.id === selectedStudent)?.name}
              </h3>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exercise Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correct
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progressData.map((progress, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{progress.exerciseGroup}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            progress.level === 'Basic' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {progress.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.correct}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{progress.percentage}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  progress.percentage >= 80 
                                    ? 'bg-green-600' 
                                    : progress.percentage >= 60 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-600'
                                }`} 
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {progress.percentage >= 80 
                                ? 'Excellent' 
                                : progress.percentage >= 60 
                                  ? 'Good' 
                                  : 'Needs Practice'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {progressData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No progress data available for this student</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {!selectedStudent && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Please select a student to view their progress</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracking;