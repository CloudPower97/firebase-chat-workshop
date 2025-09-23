import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { connectFirestoreEmulator, serverTimestamp as fsServerTimestamp, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage'; // Importa Storage

export const firebaseConfig = { // Esporta firebaseConfig
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`, // Aggiungi storageBucket con fallback
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const dbFs = getFirestore(app);
export const dbRtdb = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Esporta l'istanza di Storage

export const serverTimestampFs = fsServerTimestamp;
export const serverTimestampRtdb = rtdbServerTimestamp;

// Connect to emulators in development
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(dbFs, 'localhost', 8080);
  connectDatabaseEmulator(dbRtdb, 'localhost', 9000);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199); // Connetti l'emulatore di Storage
  console.log('Connected to Firebase Emulators!');
}
