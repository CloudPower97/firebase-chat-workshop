import { createContext } from 'react';
import type { User } from '../types/user'; // Importa l'interfaccia User

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface AppContextType {
  me: User | null;
  setMe: (user: User) => void;
  showSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
