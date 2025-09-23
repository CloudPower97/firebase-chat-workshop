import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Avatar as MuiAvatar,
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useRef, useState } from 'react';
import { dbFs, storage } from '../firebase'; // Importa le istanze centralizzate

// Usa le istanze centralizzate di Firebase
const db = dbFs;

interface UploadAvatarDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentAvatarUrl?: string;
  onAvatarUploaded: (newAvatarUrl: string) => void;
}

function UploadAvatarDialog({
  open,
  onClose,
  userId,
  currentAvatarUrl,
  onAvatarUploaded,
}: UploadAvatarDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setError('Seleziona un file immagine da caricare.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `avatars/${userId}/${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Aggiorna il documento dell'utente in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        avatar: downloadURL,
      });

      onAvatarUploaded(downloadURL);
      onClose();
    } catch (err) {
      console.error('Errore durante l\'upload o l\'aggiornamento dell\'avatar:', err);
      setError('Errore durante il caricamento dell\'avatar. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentAvatarUrl);
    setUploading(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Carica un nuovo avatar
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2,
          }}
        >
          <MuiAvatar
            src={previewUrl || currentAvatarUrl}
            alt="Avatar Preview"
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {selectedFile ? selectedFile.name : 'Seleziona Immagine'}
          </Button>
          {error && <Box sx={{ color: 'error.main' }}>{error}</Box>}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Annulla
        </Button>
        <Button
          onClick={handleUploadAvatar}
          disabled={!selectedFile || uploading}
          variant="contained"
        >
          {uploading ? 'Caricamento...' : 'Carica Avatar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadAvatarDialog;
