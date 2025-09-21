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
export const createExercise = async (exerciseData) => {
  try {
    // Split large exercises into chunks to avoid Firestore 1MB limit
    const MAX_QUESTIONS_PER_DOC = 100; // Adjust based on question size
    const { questions, ...exerciseInfo } = exerciseData;

    if (!questions || questions.length === 0) {
      throw new Error('Exercise must have questions');
    }

    const exerciseIds = [];

    // Split questions into chunks
    for (let i = 0; i < questions.length; i += MAX_QUESTIONS_PER_DOC) {
      const questionChunk = questions.slice(i, i + MAX_QUESTIONS_PER_DOC);
      const chunkNumber = Math.floor(i / MAX_QUESTIONS_PER_DOC) + 1;

      const exerciseChunk = {
        ...exerciseInfo,
        questions: questionChunk,
        chunkNumber,
        totalChunks: Math.ceil(questions.length / MAX_QUESTIONS_PER_DOC),
        totalQuestions: questions.length
      };

      const exerciseRef = doc(collection(db, 'exercises'));
      await setDoc(exerciseRef, exerciseChunk);
      exerciseIds.push(exerciseRef.id);
    }

    return { exerciseIds, totalChunks: exerciseIds.length };
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

export const deleteAllExercises = async () => {
  try {
    const q = query(collection(db, 'exercises'));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error deleting exercises:', error);
    throw error;
  }
};

export const getExercisesByLevel = async (level) => {
  try {
    // Query exercises collection with level filter
    const q = query(
      collection(db, 'exercises'),
      where('level', '==', level)
    );

    const querySnapshot = await getDocs(q);
    const exerciseChunks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group chunks by exercise group and merge questions
    const exerciseGroups = {};

    exerciseChunks.forEach(chunk => {
      const groupKey = `${chunk.group}`;

      if (!exerciseGroups[groupKey]) {
        exerciseGroups[groupKey] = {
          id: groupKey,
          level: chunk.level,
          group: chunk.group,
          questions: [],
          totalQuestions: chunk.totalQuestions || chunk.questions?.length || 0
        };
      }

      // Add questions from this chunk
      if (chunk.questions) {
        exerciseGroups[groupKey].questions.push(...chunk.questions);
      }
    });

    // Convert to array and sort questions by ID
    return Object.values(exerciseGroups).map(exercise => ({
      ...exercise,
      questions: exercise.questions.sort((a, b) => (a.id || 0) - (b.id || 0))
    }));
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