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

      console.log('Attempting student login:', { email, classroom, name });

      try {
        // Try to sign in existing student
        console.log('Trying to sign in existing student...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Successfully signed in existing student:', userCredential.user.uid);

        // Get student data from Firestore
        const studentDoc = await getDoc(doc(db, 'students', userCredential.user.uid));
        console.log('Student doc exists:', studentDoc.exists());
        if (studentDoc.exists()) {
          const studentInfo = studentDoc.data();
          console.log('Found existing student data:', studentInfo);
          setStudentData(studentInfo);
          setUserRole('student');
          return userCredential.user;
        } else {
          // Student user exists but student document is missing - create it
          console.log('Student user exists but document missing, creating student document...');
          const studentInfo = {
            name,
            classroom,
            flashSpeed: 1,
            responseTime: 30,
            createdAt: new Date()
          };

          await setDoc(doc(db, 'students', userCredential.user.uid), studentInfo);
          console.log('Student document created for existing user');
          setStudentData(studentInfo);
          setUserRole('student');
          return userCredential.user;
        }
      } catch (signInError) {
        console.log('Sign in error:', signInError.code, signInError.message);
        // If student doesn't exist, create new account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          console.log('Creating new student account...');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('Created new student account:', userCredential.user.uid);

          // Create student document in Firestore
          const studentInfo = {
            name,
            classroom,
            flashSpeed: 1,
            responseTime: 30,
            createdAt: new Date()
          };

          console.log('Creating student document:', studentInfo);
          await setDoc(doc(db, 'students', userCredential.user.uid), studentInfo);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            role: 'student',
            studentId: userCredential.user.uid
          });

          console.log('Student documents created successfully');
          setStudentData(studentInfo);
          setUserRole('student');
          return userCredential.user;
        } else {
          throw signInError;
        }
      }
    } catch (error) {
      console.error('Student login error:', error);
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
      console.log('Auth state changed:', user?.uid);
      if (user) {
        setCurrentUser(user);

        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log('User doc exists:', userDoc.exists());
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            setUserRole(userData.role);

            // If student, get student data
            if (userData.role === 'student') {
              console.log('Fetching student data for:', user.uid);
              const studentDoc = await getDoc(doc(db, 'students', user.uid));
              console.log('Student doc exists:', studentDoc.exists());
              if (studentDoc.exists()) {
                const studentInfo = studentDoc.data();
                console.log('Student data:', studentInfo);
                setStudentData(studentInfo);
              } else {
                console.error('Student document not found for user:', user.uid);
                // Student role exists but document missing - this shouldn't happen in normal flow
                // but we'll handle it gracefully by setting studentData to null
                setStudentData(null);
              }
            }
          } else {
            console.error('User document not found for:', user.uid);
          }
        } catch (error) {
          console.error('Error fetching user/student data:', error);
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