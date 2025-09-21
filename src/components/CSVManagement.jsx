import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  getCSVFiles, 
  uploadCSVFile, 
  deleteCSVFile 
} from '../utils/firebaseUtils';
import { parseCSVToExercises } from '../utils/csvUtils';
import CSVFile from '../models/CSVFile';

const CSVManagement = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCSVFiles();
  }, []);

  const fetchCSVFiles = async () => {
    try {
      setLoading(true);
      const files = await getCSVFiles();
      setCsvFiles(files);
    } catch (err) {
      setError('Failed to fetch CSV files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  const uploadCSV = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      // Process each uploaded file
      for (const file of uploadedFiles) {
        // Determine level from filename or default to Basic
        const level = file.name.includes('junior') ? 'Junior' : 'Basic';
        
        // Create metadata
        const metadata = new CSVFile({
          fileName: file.name,
          level,
          uploadedBy: 'Current Teacher', // In real app, this would be the actual teacher name
        });
        
        const validation = metadata.validate();
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        
        // Upload file and save metadata
        const csvData = await uploadCSVFile(file, metadata.toFirestore());

        // Parse CSV and save exercises to Firestore
        const fileText = await file.text();
        const exercises = parseCSVToExercises(fileText, level);

        // Clear existing exercises for this level to avoid duplicates
        const { createExercise, deleteAllExercises } = await import('../utils/firebaseUtils');

        if (exercises.length > 0) {
          console.log('Clearing existing exercises...');
          await deleteAllExercises();
        }

        // Save each exercise to Firestore
        let totalChunks = 0;

        for (const exercise of exercises) {
          const result = await createExercise(exercise);
          totalChunks += result.totalChunks;
        }

        console.log(`Uploaded CSV and created ${exercises.length} exercise groups (${totalChunks} documents):`, csvData);
      }
      
      // Clear uploaded files and refresh list
      setUploadedFiles([]);
      fetchCSVFiles();
    } catch (err) {
      setError('Failed to upload CSV: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteCSV = async (id, fileName) => {
    try {
      await deleteCSVFile(id, fileName);
      fetchCSVFiles();
    } catch (err) {
      setError('Failed to delete CSV: ' + err.message);
      console.error(err);
    }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">CSV Management</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV Files</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              
              <div className="flex text-sm text-gray-600 mt-4">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept=".csv" 
                    multiple 
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                CSV files only
              </p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Selected files:</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="py-2 flex justify-between">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={uploadCSV}
                  disabled={isUploading}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload CSV Files'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* CSV Files List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Uploaded CSV Files</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvFiles.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        file.level === 'Basic' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {file.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploadedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteCSV(file.id, file.fileName)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {csvFiles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No CSV files uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVManagement;