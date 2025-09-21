import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Flash Math
        </h1>
        <p className="text-xl text-white mb-10 opacity-90">
          Practice mental math with flashing numbers
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">👩‍🏫</div>
            <h3 className="text-2xl font-bold mb-2">For Teachers</h3>
            <p className="mb-4 opacity-90">
              Upload CSV files, manage students, and track progress
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-purple-600 font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition"
            >
              Teacher Login
            </button>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">🧒</div>
            <h3 className="text-2xl font-bold mb-2">For Students</h3>
            <p className="mb-4 opacity-90">
              Practice math exercises with flashing numbers
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-purple-600 font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition"
            >
              Student Login
            </button>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <p>Teachers upload CSV files with math exercises</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <p>Numbers flash on screen at configurable speeds</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <p>Students input answers and receive instant feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;