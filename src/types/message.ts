import { FieldValue, Timestamp } from 'firebase/firestore';

export interface FirestoreMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp | FieldValue;
}

export interface RtdbMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: number | FieldValue; // RTDB uses numbers for timestamps or FieldValue
}
