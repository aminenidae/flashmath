import { useState, useEffect, useRef } from 'react';
import { saveProgress } from '../utils/firebaseUtils';
import { useAuth } from '../contexts/AuthContext';
import Progress from '../models/Progress';

const FlashMode = ({ exercise, onExit }) => {
  const { studentData } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(-1);
  const [numbers, setNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [sessionData, setSessionData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);
  const intervalRef = useRef(null);

  // Get current question from exercise
  const getCurrentQuestion = () => {
    if (!exercise || !exercise.questions || currentQuestionIndex >= exercise.questions.length) {
      return null;
    }
    return exercise.questions[currentQuestionIndex];
  };

  useEffect(() => {
    // Initialize with first question if available
    const question = getCurrentQuestion();
    if (question && question.numbers) {
      setNumbers(question.numbers);

      // Start the flashing sequence after a short delay
      const startTimer = setTimeout(() => {
        startFlashing();
      }, 1000);

      return () => {
        clearTimeout(startTimer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [currentQuestionIndex, exercise]);

  const startFlashing = () => {
    let index = 0;
    setCurrentNumberIndex(0);
    setIsFlashing(true);

    const flashSpeed = studentData?.flashSpeed || 1;

    intervalRef.current = setInterval(() => {
      index++;
      if (index < numbers.length) {
        setCurrentNumberIndex(index);
      } else {
        // Finished flashing all numbers
        clearInterval(intervalRef.current);
        setIsFlashing(false);
        setCurrentNumberIndex(-1);
        setTimeout(() => {
          // Focus on input field
          document.getElementById('answer-input')?.focus();
        }, 100);
      }
    }, flashSpeed * 1000);
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();

    const question = getCurrentQuestion();
    if (!question) return;

    const correctAnswer = question.correctAnswer;
    const answerIsCorrect = parseInt(userAnswer) === correctAnswer;

    setIsCorrect(answerIsCorrect);
    setShowFeedback(true);

    // Store session data
    const progressModel = new Progress({
      studentId: studentData?.id || 'anonymous',
      level: exercise.level,
      exerciseGroup: exercise.group,
      questionId: question.id,
      response: userAnswer,
      isCorrect: answerIsCorrect
    });

    const progressData = progressModel.toFirestore();

    setSessionData(prev => [...prev, progressData]);

    // Hide feedback and move to next question
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');

      // Move to next question or end exercise
      if (currentQuestionIndex < exercise.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Exercise complete, show save prompt
        setShowSavePrompt(true);
      }
    }, 2000);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Save each progress item to Firestore
      for (const progressData of sessionData) {
        await saveProgress(progressData);
      }
      
      // Clear session data and exit
      setSessionData([]);
      onExit();
    } catch (err) {
      setError('Failed to save progress: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardProgress = () => {
    // Discard local session data
    setSessionData([]);
    onExit();
  };

  const handleExit = () => {
    if (sessionData.length > 0) {
      setShowSavePrompt(true);
    } else {
      onExit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={handleExit}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">{exercise.group}</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 bg-red-500 bg-opacity-80 text-white p-2 rounded text-center">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {isFlashing && currentNumberIndex >= 0 && currentNumberIndex < numbers.length ? (
          // Flashing number
          <div className="text-9xl font-bold animate-pulse">
            {numbers[currentNumberIndex]}
          </div>
        ) : showFeedback ? (
          // Feedback
          <div className={`text-8xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✅' : '❌'}
          </div>
        ) : (
          // Answer input
          <div className="w-full max-w-md">
            <form onSubmit={handleAnswerSubmit} className="flex flex-col items-center">
              <label htmlFor="answer-input" className="text-2xl mb-4">
                What was the sum?
              </label>
              <input
                id="answer-input"
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full text-6xl text-center bg-white bg-opacity-20 rounded-lg p-4 mb-6 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="?"
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="p-4 text-center">
        <div className="space-y-2">
          {/* Number flash progress */}
          {isFlashing && (
            <div className="inline-flex space-x-2">
              {numbers.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-full ${
                    index < currentNumberIndex
                      ? 'bg-green-400'
                      : index === currentNumberIndex
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-white bg-opacity-30'
                  }`}
                ></div>
              ))}
            </div>
          )}
          {/* Question progress */}
          <div className="text-white text-sm">
            Question {currentQuestionIndex + 1} of {exercise?.questions?.length || 0}
          </div>
        </div>
      </div>

      {/* Save Progress Prompt */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Save Progress?</h3>
            <p className="mb-6">
              Do you want to save your progress before exiting?
            </p>
            {error && (
              <div className="mb-4 bg-red-100 text-red-700 p-2 rounded">
                {error}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleDiscardProgress}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashMode;