import { Button, Card, CardContent, Typography, Box, Alert, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { useMessaging } from '../hooks/useMessaging';

interface NotificationSettingsProps {
  userId?: string;
}

function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { permission, token, error, requestPermission } = useMessaging({ userId });

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'success' as const, text: 'Abilitate', icon: <NotificationsIcon /> };
      case 'denied':
        return { color: 'error' as const, text: 'Bloccate', icon: <NotificationsOffIcon /> };
      default:
        return { color: 'warning' as const, text: 'Non richieste', icon: <NotificationsOffIcon /> };
    }
  };

  const status = getPermissionStatus();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Impostazioni Notifiche
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip
            icon={status.icon}
            label={`Notifiche: ${status.text}`}
            color={status.color}
            variant="outlined"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {permission !== 'granted' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Abilita le notifiche per ricevere aggiornamenti sui nuovi messaggi e post.
            </Typography>
            <Button
              variant="contained"
              startIcon={<NotificationsIcon />}
              onClick={requestPermission}
              disabled={permission === 'denied'}
            >
              {permission === 'denied' ? 'Notifiche Bloccate' : 'Abilita Notifiche'}
            </Button>
            {permission === 'denied' && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Le notifiche sono state bloccate. Puoi abilitarle nelle impostazioni del browser.
              </Typography>
            )}
          </Box>
        )}

        {permission === 'granted' && (
          <Alert severity="success">
            ✅ Le notifiche sono abilitate! Riceverai aggiornamenti sui nuovi contenuti.
          </Alert>
        )}

        {token && import.meta.env.DEV && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              FCM Token (dev only): {token.substring(0, 20)}...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;
