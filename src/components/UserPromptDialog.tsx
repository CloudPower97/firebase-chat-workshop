import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';

interface UserPromptDialogProps {
  open: boolean;
  onSubmit: (name: string, surname: string) => void;
  onClose: () => void;
}

function UserPromptDialog({ open, onSubmit, onClose }: UserPromptDialogProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const handleSubmit = () => {
    if (name.trim() && surname.trim()) {
      onSubmit(name.trim(), surname.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} disableEscapeKeyDown>
      <DialogTitle>Enter Your Name</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your name and surname. This information will be visible to other users.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          id="surname"
          label="Surname"
          type="text"
          fullWidth
          variant="standard"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit} disabled={!name.trim() || !surname.trim()}>
          Start Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserPromptDialog;
