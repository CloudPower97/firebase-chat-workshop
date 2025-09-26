import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  scope?: string;
  scriptURL?: string;
  state?: string;
  error?: string;
}

function ServiceWorkerDebug() {
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    registered: false,
    active: false,
  });

  const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus({
        registered: false,
        active: false,
        error: 'Service Workers not supported in this browser',
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

      if (registration) {
        setSwStatus({
          registered: true,
          active: !!registration.active,
          scope: registration.scope,
          scriptURL: registration.active?.scriptURL,
          state: registration.active?.state,
        });
      } else {
        setSwStatus({
          registered: false,
          active: false,
          error: 'Service Worker not found',
        });
      }
    } catch (error) {
      setSwStatus({
        registered: false,
        active: false,
        error: `Error checking Service Worker: ${error}`,
      });
    }
  };

  const testNotification = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          // Simula una notifica FCM
          registration.active.postMessage({
            'firebase-messaging-msg-type': 'push-received',
            'firebase-messaging-msg-data': {
              notification: {
                title: 'Test Notification',
                body: 'Questa è una notifica di test per il Service Worker',
                icon: '/vite.svg'
              },
              data: {
                type: 'test',
                timestamp: Date.now()
              }
            }
          });
          console.log('Test notification sent to Service Worker');
        }
      });
    }
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          checkServiceWorkerStatus();
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          setSwStatus({
            registered: false,
            active: false,
            error: `Registration failed: ${error.message}`,
          });
        });
    }
  };

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const getStatusChip = () => {
    if (swStatus.error) {
      return <Chip icon={<ErrorIcon />} label="Error" color="error" />;
    }
    if (swStatus.registered && swStatus.active) {
      return <Chip icon={<CheckCircleIcon />} label="Active & Running" color="success" />;
    }
    if (swStatus.registered) {
      return <Chip label="Registered but not active" color="warning" />;
    }
    return <Chip icon={<ErrorIcon />} label="Not Registered" color="error" />;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Service Worker Status
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {getStatusChip()}
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={checkServiceWorkerStatus}
          >
            Refresh
          </Button>
        </Box>

        {swStatus.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {swStatus.error}
          </Alert>
        )}

        {swStatus.registered && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Scope:</strong> {swStatus.scope}<br />
              <strong>Script URL:</strong> {swStatus.scriptURL}<br />
              <strong>State:</strong> {swStatus.state}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          {!swStatus.registered && (
            <Button
              variant="contained"
              onClick={registerServiceWorker}
              size="small"
            >
              Register Service Worker
            </Button>
          )}

          {swStatus.registered && swStatus.active && (
            <Button
              variant="outlined"
              onClick={testNotification}
              size="small"
            >
              Test Background Notification
            </Button>
          )}
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
          💡 Per vedere le notifiche in background, chiudi questo tab dopo il test
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ServiceWorkerDebug;
