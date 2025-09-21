# Flash Math - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Data Models](#data-models)
6. [Firebase Setup](#firebase-setup)
7. [Authentication](#authentication)
8. [Components](#components)
9. [Utilities](#utilities)
10. [Offline Support](#offline-support)
11. [Development](#development)
12. [Deployment](#deployment)

## Overview

Flash Math is a web application designed to help students practice mental math through flashing numbers. The application allows teachers to upload CSV files containing math exercises, and students can practice these exercises with configurable flash speeds and response times.

## Features

### Authentication
- Firebase Authentication with email/password
- Role-based access (Teacher vs Student)
- Secure login/logout

### Teacher Dashboard
- Student profile management (CRUD operations)
- CSV file upload, view, and delete
- Progress tracking for students

### Student Interface
- Login with name/ID/password
- Access only to assigned classroom level
- Exercise list display
- Flash math session with configurable timing
- Progress saving/discard prompt

### Data & Storage
- Firestore for structured data (students, exercises, progress)
- Firebase Storage for CSV files
- Data validation and modeling

### Offline Support
- PWA capabilities for offline use
- Local caching of exercises and student profiles
- Progress synchronization when online

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **CSV Parsing**: PapaParse
- **Routing**: React Router
- **Offline Support**: Service Workers

## Project Structure

```
src/
├── components/          # React components
├── models/              # Data models
├── utils/               # Utility functions
├── firebase.js          # Firebase configuration
├── App.jsx              # Main app component
└── main.jsx             # Entry point

public/
├── sw.js                # Service worker
├── manifest.json        # PWA manifest
└── vite.svg             # App icon
```

## Data Models

### Student
```javascript
{
  id: string,
  name: string,
  password: string,        // hashed
  age: number,
  classroom: "Basic" | "Junior",
  flashSpeed: number,      // seconds between flashes
  responseTime: number     // allowed response time in seconds
}
```

### Exercise
```javascript
{
  level: "Basic" | "Junior",
  group: string,
  questions: [
    {
      id: number,
      numbers: number[],     // numbers to flash
      correctAnswer: number
    }
  ]
}
```

### Progress
```javascript
{
  studentId: string,
  level: string,
  exerciseGroup: string,
  questionId: number,
  response: string,
  isCorrect: boolean,
  timestamp: string
}
```

### CSVFile
```javascript
{
  id: string,
  fileName: string,
  level: "Basic" | "Junior",
  uploadedBy: string,
  createdAt: string
}
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Copy configuration to `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Authentication

The app uses Firebase Authentication with email/password providers. Teachers and students are differentiated by their email addresses or by a role field in Firestore.

### Teacher Accounts
- Full dashboard access
- Student management
- CSV file management
- Progress tracking

### Student Accounts
- Limited to their assigned classroom level
- Exercise practice only
- Progress saving capabilities

## Components

### LoginPage
Handles user authentication with email/password.

### TeacherDashboard
Main dashboard for teachers with tab navigation:
- StudentManagement
- CSVManagement
- ProgressTracking

### StudentInterface
Main interface for students:
- ExerciseList
- FlashMode

### StudentManagement
CRUD operations for student profiles with form validation.

### CSVManagement
Upload, view, and delete CSV files with parsing capabilities.

### ProgressTracking
View student progress with filtering and visualization.

### ExerciseList
Display available exercises for the student's classroom level.

### FlashMode
Core feature component for flashing numbers and collecting answers.

## Utilities

### firebaseUtils.js
Helper functions for Firebase operations:
- Student CRUD operations
- Exercise management
- Progress tracking
- CSV file handling

### csvUtils.js
CSV parsing and conversion utilities:
- Parse CSV to exercise format
- Convert exercises to CSV

## Offline Support

The app implements PWA capabilities for offline use:
- Service worker for caching
- Manifest file for installation
- Local storage for session data
- Automatic sync when online

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create Firebase project and configure `.env` file
4. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

The app can be deployed to any static hosting service:
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to your hosting provider

For Firebase Hosting:
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Initialize Firebase project:
   ```bash
   firebase init
   ```
3. Deploy:
   ```bash
   firebase deploy
   ```

## CSV File Format

CSV files should follow this format:
- Column A: Group name (optional)
- Columns C-I: Numbers to flash (up to 7 numbers)
- Column J: Correct answer

Example:
```
Group,Question,Num1,Num2,Num3,Num4,Num5,Num6,Num7,Answer
Addition Drill,1,5,7,2,9,,,23
Addition Drill,2,4,3,8,1,,,16
```

## Customization

### Flash Speed
Configurable per student in seconds (0.5-5 seconds)

### Response Time
Configurable per student in seconds (5-30 seconds)

### Classroom Levels
- Basic (for younger students)
- Junior (for older students)

## Troubleshooting

### Common Issues
1. **Firebase configuration errors**: Check `.env` file values
2. **CSV parsing issues**: Ensure correct file format
3. **Offline sync problems**: Check service worker registration
4. **Performance issues**: Optimize large exercise sets

### Debugging
- Check browser console for errors
- Use Firebase Console for database issues
- Verify network requests in DevTools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.