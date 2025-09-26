// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

let firebaseApp;
let messaging;

// Ascolta i messaggi dal client principale per ricevere la configurazione Firebase
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseApp) {
      try {
        firebaseApp = firebase.initializeApp(event.data.config);
        messaging = firebase.messaging(firebaseApp);
        console.log('[firebase-messaging-sw.js] Firebase initialized successfully');

        // Inizializza i listener dopo che Firebase è stato configurato
        initializeMessagingListeners();
      } catch (error) {
        console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
      }
    }
  }
});

console.log('[firebase-messaging-sw.js] Service Worker loaded');

// Funzione per inizializzare i listener dei messaggi
function initializeMessagingListeners() {
  if (!messaging) {
    console.warn('[firebase-messaging-sw.js] Messaging not initialized yet');
    return;
  }

  // Gestione dei messaggi in background
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Nuovo messaggio';
    const notificationOptions = {
      body: payload.notification?.body || 'Hai ricevuto un nuovo messaggio',
      icon: '/firebase-logo.png', // Aggiungi un'icona se disponibile
      badge: '/firebase-logo.png',
      data: payload.data,
      actions: [
        {
          action: 'open-app',
          title: 'Apri App'
        },
        {
          action: 'dismiss',
          title: 'Ignora'
        }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Gestione dei click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'open-app' || !event.action) {
    // Apri o focalizza l'app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
