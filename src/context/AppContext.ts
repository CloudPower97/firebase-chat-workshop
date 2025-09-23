import { createContext } from 'react';

interface User {
  id: string;
  name: string;
}

interface AppContextType {
  me: User | null;
  setMe: (user: User) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
