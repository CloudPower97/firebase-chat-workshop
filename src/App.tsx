import { Alert, Box, CssBaseline, Snackbar } from '@mui/material';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import UserPromptDialog from './components/UserPromptDialog';
import { AppContext, type SnackbarSeverity } from './context/AppContext';
import { auth, db } from './firebase';
import { useMessaging } from './hooks/useMessaging';
import Auth from './pages/Auth';
import Home from './pages/Home';
import type { User } from './types/user';
import { getMyUser, setMyUser } from './utils/storage';

function App() {
  const [me, setMeState] = useState<User | null>(null);
  const [openUserPrompt, setOpenUserPrompt] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Inizializza Firebase Messaging
  const { requestPermission, permission, token, error } = useMessaging({
    userId: firebaseUser?.uid,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      console.log('Auth state changed, user:', user);

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
            const userData = userDocSnap.data();

            // Verifica che l'utente abbia tutti i dati necessari
            if (userData.name && userData.surname && userData.email) {
              const completeUser = { ...userData, id: user.uid } as User;
              setMyUser(completeUser); // Salva in localStorage
              setMeState(completeUser);
            } else {
              // Il documento esiste ma non ha tutti i dati necessari
              // (probabilmente contiene solo fcmToken)
              console.log('User document exists but is incomplete, requesting user info');
              setOpenUserPrompt(true);
            }
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

    // Salva i dati dell'utente in Firestore preservando eventuali dati esistenti (come fcmToken)
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser, { merge: true });

    // Ora leggi i dati completi dal database per includere eventuali campi esistenti
    const updatedUserDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const completeUserData = { ...updatedUserDoc.data(), id: firebaseUser.uid } as User;

    setMyUser(completeUserData);
    setMeState(completeUserData);
    setOpenUserPrompt(false);
  };

  const handleUserChangeRequest = () => {
    setOpenUserPrompt(true);
  };

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Effetto per gestire gli errori di Firebase Messaging
  useEffect(() => {
    if (error) {
      showSnackbar(`Notification error: ${error}`, 'error');
    }
  }, [error]);

  // Effetto per richiedere il permesso per le notifiche quando l'utente è autenticato
  useEffect(() => {
    if (firebaseUser && permission === 'default') {
      // Chiedi il permesso per le notifiche dopo un breve delay per migliorare l'UX
      const timer = setTimeout(() => {
        requestPermission().then((granted) => {
          if (granted) {
            showSnackbar('Notifiche abilitate!', 'success');
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [firebaseUser, permission, requestPermission]);

  // Log del token FCM (solo per development)
  useEffect(() => {
    if (token && import.meta.env.DEV) {
      console.log('FCM Token aggiornato:', token);
    }
  }, [token]);

  const appContextValue = useMemo(
    () => ({ me, setMe: setMyUser, showSnackbar }),
    [me]
  );

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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
}

export default App;
