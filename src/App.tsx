import { Box, CssBaseline } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UserPromptDialog from './components/UserPromptDialog';
import { AppContext } from './context/AppContext';
import Home from './pages/Home';
import { getMyUser, setMyUser } from './utils/storage';

interface User {
  id: string;
  name: string;
}

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

  const handleUserPromptSubmit = (name: string) => {
    const newUser: User = { id: uuidv4(), name };
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
        open={openUserPrompt || !me} // Open if explicitly requested or no user is set
        onSubmit={handleUserPromptSubmit}
        onClose={() => setOpenUserPrompt(false)} // Allow closing if a user is already set
      />
    </AppContext.Provider>
  );
}

export default App;
