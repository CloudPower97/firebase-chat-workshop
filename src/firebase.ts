import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { connectFirestoreEmulator, getFirestore, serverTimestamp as fsServerTimestamp } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getRemoteConfig } from 'firebase/remote-config';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const dbRtdb = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const messaging = getMessaging(app);
export const remoteConfig = getRemoteConfig(app);

export const serverTimestampFs = fsServerTimestamp;
export const serverTimestampRtdb = rtdbServerTimestamp;

// Connect to emulators in development
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectDatabaseEmulator(dbRtdb, 'localhost', 9000);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Connected to Firebase Emulators!');
}
