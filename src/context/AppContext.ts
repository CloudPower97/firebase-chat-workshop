import { createContext } from 'react';
import type { User } from '../types/user'; // Importa l'interfaccia User

interface AppContextType {
  me: User | null;
  setMe: (user: User) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
