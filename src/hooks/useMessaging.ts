import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { messaging, db, firebaseConfig } from '../firebase';

interface UseMessagingProps {
  userId?: string;
}

interface MessagingState {
  token: string | null;
  permission: NotificationPermission;
  error: string | null;
}

export const useMessaging = ({ userId }: UseMessagingProps = {}) => {
  const [state, setState] = useState<MessagingState>({
    token: null,
    permission: 'default',
    error: null,
  });

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setState(prev => ({ ...prev, error: 'This browser does not support notifications' }));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        await getMessagingToken();
        return true;
      } else {
        setState(prev => ({ ...prev, error: 'Permission denied for notifications' }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, error: 'Failed to request notification permission' }));
      return false;
    }
  };

  const sendConfigToServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
        console.log('Firebase config sent to service worker');
      }
    }
  };

  const getMessagingToken = useCallback(async () => {
    if (!messaging) {
      setState(prev => ({ ...prev, error: 'Firebase Messaging not initialized' }));
      return;
    }

    try {
      // Invia la configurazione al service worker prima di ottenere il token
      await sendConfigToServiceWorker();

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        setState(prev => ({ ...prev, error: 'VAPID key not configured' }));
        return;
      }

      const token = await getToken(messaging, { vapidKey });

      if (token) {
        setState(prev => ({ ...prev, token, error: null }));

        // Salva il token nel documento dell'utente se userId è fornito
        if (userId) {
          await saveTokenToDatabase(userId, token);
        }

        console.log('FCM Registration token:', token);
      } else {
        setState(prev => ({ ...prev, error: 'No registration token available' }));
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      setState(prev => ({ ...prev, error: 'Failed to get messaging token' }));
    }
  }, [userId]);

  const saveTokenToDatabase = async (userId: string, token: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);

      // Controlla se il documento utente esiste prima di aggiornare il token
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // L'utente esiste, aggiorna solo il token
        await setDoc(userDocRef, {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        }, { merge: true });
        console.log('FCM token saved to database');
      } else {
        console.log('User document not found, skipping token save. Token will be saved when user completes registration.');
        // Non salvare il token se l'utente non esiste ancora
        // Il token verrà salvato dopo che l'utente completa la registrazione
      }
    } catch (error) {
      console.error('Error saving FCM token to database:', error);
    }
  };

  const setupForegroundMessageListener = () => {
    if (!messaging) return;

    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      // Mostra una notifica personalizzata quando l'app è in foreground
      if (payload.notification) {
        const { title, body } = payload.notification;

        // Puoi personalizzare come gestire le notifiche in foreground
        // Ad esempio, mostrare un toast o aggiornare l'UI
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title || 'Nuovo messaggio', {
            body: body || 'Hai ricevuto un nuovo messaggio',
            icon: '/firebase-logo.png',
            tag: 'chat-notification', // Sostituisce notifiche precedenti con lo stesso tag
          });
        }
      }
    });
  };

  useEffect(() => {
    // Controlla il permesso corrente
    if ('Notification' in window) {
      setState(prev => ({ ...prev, permission: Notification.permission }));
    }

    // Se il permesso è già concesso e abbiamo un userId, ottieni il token
    if (Notification.permission === 'granted' && userId) {
      getMessagingToken();
    }

    // Configura il listener per i messaggi in foreground
    const unsubscribe = setupForegroundMessageListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, getMessagingToken]);

  return {
    ...state,
    requestPermission,
    getMessagingToken,
  };
};
