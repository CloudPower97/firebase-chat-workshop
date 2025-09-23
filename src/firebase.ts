import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { connectFirestoreEmulator, serverTimestamp as fsServerTimestamp, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const dbFs = getFirestore(app);
export const dbRtdb = getDatabase(app);
export const auth = getAuth(app);

export const serverTimestampFs = fsServerTimestamp;
export const serverTimestampRtdb = rtdbServerTimestamp;

// Connect to emulators in development
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(dbFs, 'localhost', 8080);
  connectDatabaseEmulator(dbRtdb, 'localhost', 9000);
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('Connected to Firebase Emulators!');
}
