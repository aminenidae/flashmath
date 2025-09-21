import { useAuth } from '../contexts/AuthContext';

const TestAuth = () => {
  const { currentUser, userRole, loading, error } = useAuth();

  if (loading) {
    return <div className="p-4 bg-yellow-100">Loading auth state...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <p><strong>Current User:</strong> {currentUser ? currentUser.email : 'None'}</p>
      <p><strong>User Role:</strong> {userRole || 'None'}</p>
      <p><strong>User ID:</strong> {currentUser?.uid || 'None'}</p>
      {error && (
        <p className="text-red-600"><strong>Error:</strong> {error}</p>
      )}
    </div>
  );
};

export default TestAuth;