import { Box, CssBaseline } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UserPromptDialog from './components/UserPromptDialog';
import { AppContext } from './context/AppContext';
import Home from './pages/Home';
import type { User } from './types/user'; // Importa l'interfaccia User come type
import { getMyUser, setMyUser } from './utils/storage';

function App() {
  const [me, setMeState] = useState<User | null>(null);
  const [openUserPrompt, setOpenUserPrompt] = useState(false);

  useEffect(() => {
    const storedUser = getMyUser();
    if (storedUser) {
      setMeState(storedUser);
    } else {
      setOpenUserPrompt(true);
    }
  }, []);

  const handleUserPromptSubmit = (name: string, surname: string) => { // Aggiungi surname
    const newUser: User = { id: uuidv4(), name, surname }; // Includi surname
    setMyUser(newUser);
    setMeState(newUser);
    setOpenUserPrompt(false);
  };

  const handleUserChangeRequest = () => {
    setOpenUserPrompt(true);
  };

  const appContextValue = useMemo(() => ({ me, setMe: setMyUser }), [me]);

  return (
    <AppContext.Provider value={appContextValue}>
      <CssBaseline />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Home onUserChangeRequest={handleUserChangeRequest} />
      </Box>

      <UserPromptDialog
        open={openUserPrompt}
        onSubmit={handleUserPromptSubmit}
        onClose={() => {
          if (me) {
            setOpenUserPrompt(false);
          }
        }}
      />
    </AppContext.Provider>
  );
}

export default App;
