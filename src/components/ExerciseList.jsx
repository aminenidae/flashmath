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

      console.log('Fetching exercises for level:', classroom);

      // Fetch exercises from Firestore
      const exerciseData = await getExercisesByLevel(classroom);
      console.log('Fetched exercise data:', exerciseData);

      // Transform the data to match our component structure
      const transformedExercises = exerciseData.map(exercise => ({
        id: exercise.id,
        level: exercise.level,
        group: exercise.group,
        questionCount: exercise.questions?.length || exercise.totalQuestions || 0,
        questions: exercise.questions || [],
        lastAttempt: null, // TODO: Track this in progress data
        accuracy: null // TODO: Calculate from progress data
      }));

      console.log('Transformed exercises:', transformedExercises);
      setExercises(transformedExercises);
    } catch (err) {
      setError('Failed to fetch exercises: ' + err.message);
      console.error('Error fetching exercises:', err);
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Math Exercises</h2>
        <p className="text-gray-600">Choose an exercise group to practice. Each group contains multiple related questions.</p>
      </div>

      {exercises.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No exercises available</h3>
          <p className="text-gray-600">
            Please ask your teacher to upload exercise files for your level.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">{exercise.group}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    exercise.level === 'Basic'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exercise.level}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {exercise.questionCount} Questions
                    </p>
                    <p className="text-sm text-gray-500">
                      Practice session
                    </p>
                  </div>
                </div>

                {exercise.lastAttempt && exercise.accuracy !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">Last Performance</p>
                      <p className="text-sm text-gray-500">{exercise.lastAttempt}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          style={{ width: `${exercise.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-semibold text-gray-700">{exercise.accuracy}%</span>
                    </div>
                  </div>
                )}

                {!exercise.lastAttempt && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center py-3 px-4 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      <p className="text-sm text-blue-700 font-medium">
                        Ready to start!
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onStartExercise(exercise)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Start Exercise
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;