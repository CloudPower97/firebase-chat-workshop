import type { User } from '../types/user'; // Import the User interface

const USER_STORAGE_KEY_PREFIX = 'firebase-chat-workshop-user-';

export const getMyUser = (userId: string): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY_PREFIX + userId);
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    // Valida che l'utente abbia tutti i campi necessari
    if (user && user.name && user.surname && user.email && user.id) {
      return user;
    } else {
      // Rimuovi i dati incompleti dal localStorage
      console.log('Removing incomplete user data from localStorage');
      localStorage.removeItem(USER_STORAGE_KEY_PREFIX + userId);
      return null;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem(USER_STORAGE_KEY_PREFIX + userId);
    return null;
  }
};

export const setMyUser = (user: User) => {
  localStorage.setItem(USER_STORAGE_KEY_PREFIX + user.id, JSON.stringify(user));
};
