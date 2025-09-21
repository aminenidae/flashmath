# Flash Math

A web application for practicing mental math with flashing numbers.

## Features

- Teacher dashboard for managing students and CSV files
- Student interface for practicing math exercises
- Flashing numbers at configurable speeds
- Instant feedback on answers
- Progress tracking
- Offline support (PWA)

## Tech Stack

- React + Vite
- Firebase (Auth, Firestore, Storage)
- TailwindCSS
- PapaParse for CSV parsing

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Firebase project and add your configuration to `.env` file
4. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Configuration

Create a `.env` file in the root directory with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Project Structure

```
src/
  components/          # React components
  firebase.js          # Firebase configuration
  App.jsx              # Main app component
  main.jsx             # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build