import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// Student operations
export const createStudent = async (studentData) => {
  try {
    const studentRef = doc(collection(db, 'students'));
    await setDoc(studentRef, studentData);
    return { id: studentRef.id, ...studentData };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const getStudents = async () => {
  try {
    const q = query(collection(db, 'students'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudentById = async (id) => {
  try {
    const studentDoc = await getDoc(doc(db, 'students', id));
    if (studentDoc.exists()) {
      return { id: studentDoc.id, ...studentDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, studentData);
    return { id, ...studentData };
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    await deleteDoc(doc(db, 'students', id));
    return id;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Exercise operations
export const createExercise = async (level, group, exerciseData) => {
  try {
    const exerciseRef = doc(collection(db, 'exercises', level, group));
    await setDoc(exerciseRef, exerciseData);
    return { id: exerciseRef.id, ...exerciseData };
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

export const getExercisesByLevel = async (level) => {
  try {
    const exercises = [];
    const levelRef = collection(db, 'exercises', level);
    
    // Get all groups for this level
    const groupSnapshot = await getDocs(levelRef);
    
    for (const groupDoc of groupSnapshot.docs) {
      const groupRef = collection(db, 'exercises', level, groupDoc.id);
      const exerciseSnapshot = await getDocs(groupRef);
      
      exerciseSnapshot.docs.forEach(exerciseDoc => {
        exercises.push({
          id: exerciseDoc.id,
          group: groupDoc.id,
          level,
          ...exerciseDoc.data()
        });
      });
    }
    
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

// Progress operations
export const saveProgress = async (progressData) => {
  try {
    const progressRef = doc(collection(db, 'progress'));
    await setDoc(progressRef, progressData);
    return { id: progressRef.id, ...progressData };
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
};

export const getProgressByStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, 'progress'),
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

// CSV File operations
export const uploadCSVFile = async (file, metadata) => {
  try {
    // Upload file to storage
    const storageRef = ref(storage, `csv-files/${metadata.fileName}`);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save metadata to Firestore
    const csvRef = doc(collection(db, 'csvFiles'));
    const csvData = {
      ...metadata,
      fileUrl: downloadURL,
      uploadedAt: new Date().toISOString()
    };
    
    await setDoc(csvRef, csvData);
    
    return { id: csvRef.id, ...csvData };
  } catch (error) {
    console.error('Error uploading CSV file:', error);
    throw error;
  }
};

export const getCSVFiles = async () => {
  try {
    const q = query(collection(db, 'csvFiles'), orderBy('uploadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching CSV files:', error);
    throw error;
  }
};

export const deleteCSVFile = async (id, fileName) => {
  try {
    // Delete from storage
    const storageRef = ref(storage, `csv-files/${fileName}`);
    await deleteObject(storageRef);
    
    // Delete metadata from Firestore
    await deleteDoc(doc(db, 'csvFiles', id));
    
    return id;
  } catch (error) {
    console.error('Error deleting CSV file:', error);
    throw error;
  }
};