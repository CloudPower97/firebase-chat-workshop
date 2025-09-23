import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { onDisconnect, onValue, ref, serverTimestamp, set } from 'firebase/database';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbRtdb } from '../firebase';
import type { UserStatus } from '../types/presence';
import { formatTimestamp } from '../utils/time';

function PresencePanel() {
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const appContext = useContext(AppContext);
  const me = appContext?.me;

  useEffect(() => {
    if (!me) return;

    const userStatusRef = ref(dbRtdb, `status/${me.id}`);
    const isConnectedRef = ref(dbRtdb, '.info/connected');

    // Set up presence
    onValue(isConnectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        onDisconnect(userStatusRef).set({ online: false, at: serverTimestamp(), name: me.name });
        set(userStatusRef, { online: true, at: serverTimestamp(), name: me.name });
      }
    });

    // Listen for all user statuses
    const statusRef = ref(dbRtdb, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const users: UserStatus[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data) {
          users.push({
            id: childSnapshot.key || '',
            name: data.name,
            online: data.online,
            lastSeen: data.at,
          });
        }
      });
      // Sort online users first, then by name
      users.sort((a, b) => {
        if (a.online && !b.online) return -1;
        if (!a.online && b.online) return 1;
        return a.name.localeCompare(b.name);
      });
      setOnlineUsers(users);
    });

    return () => {
      unsubscribe();
      // Clean up on disconnect for the current user if component unmounts
      onDisconnect(userStatusRef).cancel();
    };
  }, [me]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Online Users
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {onlineUsers.map((user) => (
          <ListItem key={user.id} disablePadding>
            <ListItemText
              primary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ fontWeight: user.online ? 'bold' : 'normal' }}
                >
                  {user.name} {user.id === me?.id ? '(You)' : ''}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{ display: 'block', fontSize: '0.75rem' }}
                  component="span"
                  variant="caption"
                  color="text.disabled"
                >
                  {user.online ? 'Online' : `Last seen: ${formatTimestamp(user.lastSeen)}`}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default PresencePanel;
