import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
}

const USER_STORAGE_KEY = 'firebase-chat-workshop-user';

export const getMyUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const setMyUser = (user: User) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const generateRandomUserId = (): string => {
  return uuidv4();
};
