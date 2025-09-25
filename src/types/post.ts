import { Timestamp } from "firebase/firestore";
import type { User } from "./user";

export interface Post {
  id: string;
  author: User;
  text: string;
  createdAt: Timestamp;
  ownerId: string;
}
