import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { limitToLast, onValue, orderByChild, push, query, ref } from 'firebase/database';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbRtdb, serverTimestampRtdb } from '../firebase';
import type { RtdbMessage } from '../types/message';
import { formatTimestamp } from '../utils/time';

const ROOM_ID = 'general';

function Chat() {
  const [messages, setMessages] = useState<RtdbMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const appContext = useContext(AppContext);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const messagesRef = ref(dbRtdb, `rooms/${ROOM_ID}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(50));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const fetchedMessages: RtdbMessage[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        fetchedMessages.push({
          id: childSnapshot.key || '',
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          createdAt: data.createdAt,
        });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !appContext?.me) return;

    try {
      await push(ref(dbRtdb, `rooms/${ROOM_ID}/messages`), {
        text: newMessage,
        senderId: appContext.me.id,
        senderName: `${appContext.me.name} ${appContext.me.surname}`,
        createdAt: serverTimestampRtdb(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message to Realtime Database:', error);
    }
  };

  if (!appContext?.me) {
    return <Typography color="error">Please set your user name to chat.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper
        sx={{ flexGrow: 1, overflowY: 'auto', p: 2, mb: 2, maxHeight: 'calc(100vh - 250px)' }}
        variant="outlined"
      >
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {msg.senderName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {msg.text}
                    </Typography>
                    <Typography
                      sx={{ display: 'block', fontSize: '0.75rem' }}
                      component="span"
                      variant="caption"
                      color="text.disabled"
                    >
                      {typeof msg.createdAt === 'number' ? formatTimestamp(msg.createdAt) : 'Sending...'}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
