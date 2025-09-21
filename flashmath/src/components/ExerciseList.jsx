import { useState, useEffect } from 'react';
import { getExercisesByLevel } from '../utils/firebaseUtils';

const ExerciseList = ({ classroom, onStartExercise }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercises();
  }, [classroom]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError('');
      
      // In a real app, we would fetch exercises from Firestore
      // For now, we'll use mock data but simulate the async call
      const exerciseData = await getExercisesByLevel(classroom);
      
      // Using mock data for demonstration
      const mockExercises = [
        {
          id: '1',
          level: classroom,
          group: 'Addition Drill',
          questionCount: 10,
          lastAttempt: '2023-05-15',
          accuracy: 80
        },
        {
          id: '2',
          level: classroom,
          group: 'Subtraction Practice',
          questionCount: 15,
          lastAttempt: '2023-05-10',
          accuracy: 60
        },
        {
          id: '3',
          level: classroom === 'Basic' ? 'Junior' : 'Basic', // To show filtering works
          group: 'Multiplication Challenge',
          questionCount: 20,
          lastAttempt: '2023-05-12',
          accuracy: 90
        }
      ];
      
      // Filter by classroom level
      const filteredExercises = mockExercises.filter(
        exercise => exercise.level === classroom
      );
      
      setExercises(filteredExercises);
    } catch (err) {
      setError('Failed to fetch exercises: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (exercises.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No exercises available</h3>
        <p className="text-gray-600">
          Please check again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Exercises</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{exercise.group}</h3>
                  <p className="text-gray-600 mt-1">
                    {exercise.questionCount} questions
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  exercise.level === 'Basic' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exercise.level}
                </span>
              </div>
              
              {exercise.lastAttempt && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Last attempt: {exercise.lastAttempt}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${exercise.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{exercise.accuracy}%</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => onStartExercise(exercise)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Start Exercise
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;