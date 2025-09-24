import type { User } from '../types/user'; // Import the User interface

const USER_STORAGE_KEY_PREFIX = 'firebase-chat-workshop-user-';

export const getMyUser = (userId: string): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY_PREFIX + userId);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const setMyUser = (user: User) => {
  localStorage.setItem(USER_STORAGE_KEY_PREFIX + user.id, JSON.stringify(user));
};
