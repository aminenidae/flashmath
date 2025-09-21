import { useState, useEffect } from 'react';
import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} from '../utils/firebaseUtils';
import Student from '../models/Student';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    id: '',
    name: '',
    password: '',
    age: '',
    classroom: 'Basic',
    flashSpeed: 2,
    responseTime: 10
  });
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
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({
      ...currentStudent,
      [name]: name === 'age' || name === 'flashSpeed' || name === 'responseTime' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const studentModel = new Student(currentStudent);
      const validation = studentModel.validate();
      
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      
      const studentData = studentModel.toFirestore();
      
      if (isEditing) {
        // Update existing student
        await updateStudent(currentStudent.id, studentData);
      } else {
        // Add new student
        await createStudent(studentData);
      }
      
      // Reset form and refresh list
      setCurrentStudent({
        id: '',
        name: '',
        password: '',
        age: '',
        classroom: 'Basic',
        flashSpeed: 2,
        responseTime: 10
      });
      setIsEditing(false);
      setError('');
      fetchStudents();
    } catch (err) {
      setError('Failed to save student: ' + err.message);
      console.error(err);
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student: ' + err.message);
      console.error(err);
    }
  };

  const handleCancel = () => {
    setCurrentStudent({
      id: '',
      name: '',
      password: '',
      age: '',
      classroom: 'Basic',
      flashSpeed: 2,
      responseTime: 10
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Management</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Student Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentStudent.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={currentStudent.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={currentStudent.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom
                </label>
                <select
                  id="classroom"
                  name="classroom"
                  value={currentStudent.classroom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Junior">Junior</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="flashSpeed" className="block text-sm font-medium text-gray-700 mb-1">
                  Flash Speed (seconds)
                </label>
                <input
                  type="number"
                  id="flashSpeed"
                  name="flashSpeed"
                  value={currentStudent.flashSpeed}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.5"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Response Time (seconds)
                </label>
                <input
                  type="number"
                  id="responseTime"
                  name="responseTime"
                  value={currentStudent.responseTime}
                  onChange={handleInputChange}
                  min="5"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isEditing ? 'Update Student' : 'Add Student'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Students List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Students</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flash Speed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.classroom}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.flashSpeed}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.responseTime}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;