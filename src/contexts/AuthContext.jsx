import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teacher login
  const loginTeacher = async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is a teacher
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'teacher') {
        setUserRole('teacher');
        return userCredential.user;
      } else {
        // If no role exists, assume teacher for now (first login)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          role: 'teacher',
          createdAt: new Date()
        });
        setUserRole('teacher');
        return userCredential.user;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Student login
  const loginStudent = async (name, classroom) => {
    try {
      setError('');

      // For student login, we use anonymous auth with metadata
      const email = `${name.toLowerCase().replace(/\s+/g, '')}@student.flashmath`;
      const password = `${classroom}-${name}`;

      try {
        // Try to sign in existing student
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Get student data from Firestore
        const studentDoc = await getDoc(doc(db, 'students', userCredential.user.uid));
        if (studentDoc.exists()) {
          setStudentData(studentDoc.data());
          setUserRole('student');
          return userCredential.user;
        }
      } catch (signInError) {
        // If student doesn't exist, create new account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);

          // Create student document in Firestore
          const studentInfo = {
            name,
            classroom,
            flashSpeed: 1,
            responseTime: 30,
            createdAt: new Date()
          };

          await setDoc(doc(db, 'students', userCredential.user.uid), studentInfo);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            role: 'student',
            studentId: userCredential.user.uid
          });

          setStudentData(studentInfo);
          setUserRole('student');
          return userCredential.user;
        } else {
          throw signInError;
        }
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign up teacher
  const signupTeacher = async (email, password) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document with teacher role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'teacher',
        createdAt: new Date()
      });

      setUserRole('teacher');
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setStudentData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);

          // If student, get student data
          if (userData.role === 'student') {
            const studentDoc = await getDoc(doc(db, 'students', user.uid));
            if (studentDoc.exists()) {
              setStudentData(studentDoc.data());
            }
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setStudentData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    studentData,
    loading,
    error,
    loginTeacher,
    loginStudent,
    signupTeacher,
    logout,
    setStudentData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};