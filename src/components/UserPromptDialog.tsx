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
  onSubmit: (name: string) => void;
  onClose: () => void;
}

function UserPromptDialog({ open, onSubmit, onClose }: UserPromptDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
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
          Please enter a display name for the chat workshop. This will be stored locally.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Display Name"
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Start Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserPromptDialog;
