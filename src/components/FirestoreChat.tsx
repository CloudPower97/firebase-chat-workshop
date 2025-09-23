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
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbFs } from '../firebase';
import type { FirestoreMessage } from '../types/message';
import { formatTimestamp } from '../utils/time';

const ROOM_ID = 'general';

function FirestoreChat() {
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const appContext = useContext(AppContext);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(
      collection(dbFs, 'rooms', ROOM_ID, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: FirestoreMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreMessage[];
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
      await addDoc(collection(dbFs, 'rooms', ROOM_ID, 'messages'), {
        text: newMessage,
        senderId: appContext.me.id,
        senderName: appContext.me.name,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message to Firestore:', error);
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
                      {msg.createdAt && 'toDate' in msg.createdAt ? formatTimestamp(msg.createdAt) : 'Sending...'}
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

export default FirestoreChat;
