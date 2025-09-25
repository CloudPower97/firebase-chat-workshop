import { Box, CssBaseline } from '@mui/material';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import UserPromptDialog from './components/UserPromptDialog';
import { AppContext } from './context/AppContext';
import { auth, db } from './firebase';
import Auth from './pages/Auth';
import Home from './pages/Home';
import type { User } from './types/user';
import { getMyUser, setMyUser } from './utils/storage';

function App() {
  const [me, setMeState] = useState<User | null>(null);
  const [openUserPrompt, setOpenUserPrompt] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Cerca l'utente in localStorage
        const storedUser = getMyUser(user.uid);

        if (storedUser) {
          setMeState(storedUser);
        } else {
          // Se non è in localStorage, cercalo in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setMyUser(userData); // Salva in localStorage
            setMeState(userData);
          } else {
            // L'utente è nuovo, apri il dialogo per chiedere nome e cognome
            setOpenUserPrompt(true);
          }
        }
      } else {
        setMeState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUserPromptSubmit = async (name: string, surname: string) => {
    if (!firebaseUser) return;

    const newUser: User = {
      id: firebaseUser.uid,
      name,
      surname,
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || undefined, // Popola l'avatar se disponibile
    };

    // Salva il nuovo utente in Firestore e in localStorage
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    setMyUser(newUser);
    setMeState(newUser);
    setOpenUserPrompt(false);
  };

  const handleUserChangeRequest = () => {
    setOpenUserPrompt(true);
  };

  const appContextValue = useMemo(() => ({ me, setMe: setMyUser }), [me]);

  if (loading) {
    return <div>Loading...</div>; // O un componente di caricamento più carino
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <CssBaseline />
      {firebaseUser ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Home onUserChangeRequest={handleUserChangeRequest} />
          </Box>

          <UserPromptDialog
            open={openUserPrompt}
            onSubmit={handleUserPromptSubmit}
            onClose={() => {
              // Non chiudere il dialogo se l'utente non ha ancora inserito i dati
              if (me) {
                setOpenUserPrompt(false);
              }
            }}
          />
        </>
      ) : (
        <Auth />
      )}
    </AppContext.Provider>
  );
}

export default App;
