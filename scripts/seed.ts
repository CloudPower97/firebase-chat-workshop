import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../src/types/user.js'; // Importa l'interfaccia User (con estensione .js per Node.js ESM)

// Use Firebase Admin SDK with emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase Admin SDK (no actual credentials needed for emulators)
initializeApp({
  projectId: 'demo-chat', // Must match .firebaserc default project
  databaseURL: 'http://localhost:9000?ns=demo-chat', // Use emulator host
});

const dbFs = getFirestore();
const dbRtdb = getDatabase();

const ROOM_ID = 'general';

async function seedFirestore() {
  console.log('Seeding Firestore...');
  const roomRef = dbFs.collection('rooms').doc(ROOM_ID);
  await roomRef.set({ name: 'General Chat' }, { merge: true });

  const messagesRef = roomRef.collection('messages');

  const existingMessages = await messagesRef.limit(1).get();
  if (!existingMessages.empty) {
    console.log('Firestore already has messages. Skipping seed.');
    return;
  }

  const messages = [
    {
      text: 'Hello Firestore!',
      senderId: uuidv4(),
      senderName: 'Firestore Bot 1',
      createdAt: new Date(Date.now() - 30000), // 30 seconds ago
    },
    {
      text: 'Welcome to the workshop!',
      senderId: uuidv4(),
      senderName: 'Firestore Bot 2',
      createdAt: new Date(Date.now() - 20000), // 20 seconds ago
    },
    {
      text: 'Enjoy comparing Firestore and RTDB!',
      senderId: uuidv4(),
      senderName: 'Firestore Bot 3',
      createdAt: new Date(Date.now() - 10000), // 10 seconds ago
    },
  ];

  for (const msg of messages) {
    await messagesRef.add(msg);
  }
  console.log('Firestore seeded with 3 messages.');
}

async function seedUsers() {
  console.log('Seeding Users collection...');
  const usersRef = dbFs.collection('users');

  const existingUsers = await usersRef.limit(1).get();
  if (!existingUsers.empty) {
    console.log('Users collection already has data. Skipping seed.');
    return;
  }

  const users: User[] = [
    {
      id: uuidv4(),
      name: 'Mario',
      surname: 'Rossi',
      avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200&d=mp', // Esempio di avatar
    },
    {
      id: uuidv4(),
      name: 'Luigi',
      surname: 'Verdi',
      avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200&d=retro', // Esempio di avatar
    },
  ];

  for (const user of users) {
    await usersRef.doc(user.id).set(user);
  }
  console.log('Users collection seeded with 2 example users.');
}

async function seedRealtimeDatabase() {
  console.log('Seeding Realtime Database...');
  const messagesRef = dbRtdb.ref(`rooms/${ROOM_ID}/messages`);

  const snapshot = await messagesRef.limitToFirst(1).once('value');
  if (snapshot.exists()) {
    console.log('Realtime Database already has messages. Skipping seed.');
    return;
  }

  const messages = [
    {
      text: 'Hello Realtime Database!',
      senderId: uuidv4(),
      senderName: 'RTDB Bot 1',
      createdAt: Date.now() - 30000,
    },
    {
      text: 'This is a real-time chat.',
      senderId: uuidv4(),
      senderName: 'RTDB Bot 2',
      createdAt: Date.now() - 20000,
    },
    {
      text: 'See the differences in action!',
      senderId: uuidv4(),
      senderName: 'RTDB Bot 3',
      createdAt: Date.now() - 10000,
    },
  ];

  for (const msg of messages) {
    await messagesRef.push(msg);
  }
  console.log('Realtime Database seeded with 3 messages.');

  // Optional: Seed presence for a bot
  const botId = 'seed-bot-123';
  const botStatusRef = dbRtdb.ref(`status/${botId}`);
  await botStatusRef.set({ online: false, at: Date.now() - 5000, name: 'Seed Bot' });
  console.log('Realtime Database seeded with a bot presence status.');
}

async function main() {
  try {
    await seedFirestore();
    await seedUsers(); // Aggiungi il seeding degli utenti
    await seedRealtimeDatabase();
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
