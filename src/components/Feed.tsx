import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { db } from "../firebase";
import type { Post } from "../types/post";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const appContext = useContext(AppContext);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    postId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleDelete = async () => {
    if (selectedPostId) {
      const postRef = doc(db, "posts", selectedPostId);
      try {
        await deleteDoc(postRef);
      } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === "permission-denied") {
          appContext?.showSnackbar(
            "You don't have permission to delete a post. " + firebaseError,
            "error",
          );
        }
      }
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    const postToEdit = posts.find((p) => p.id === selectedPostId);
    if (postToEdit) {
      setEditingPostId(postToEdit.id);
      setEditedText(postToEdit.text);
    }
    handleMenuClose();
  };

  const handleUpdate = async (postId: string) => {
    if (editedText.trim() === "") return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      text: editedText,
    });
    setEditingPostId(null);
    setEditedText("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedText("");
  };

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          author: data.author,
          text: data.text,
          createdAt: data.createdAt,
          ownerId: data.ownerId,
        });
      });
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box>
      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 2 }}>
          <CardHeader
            avatar={
              <Avatar
                alt={`${post.author.name} ${post.author.surname}`}
                src={post.author.avatar || undefined}
              />
            }
            action={
              <>
                <IconButton
                  aria-label="settings"
                  onClick={(e) => handleMenuClick(e, post.id)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedPostId === post.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleEdit}>Edit</MenuItem>
                  <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
              </>
            }
            title={`${post.author.name} ${post.author.surname}`}
            subheader={
              post.createdAt
                ? formatDistanceToNow(post.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : "Just now"
            }
          />
          <CardContent>
            {editingPostId === post.id ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleUpdate(post.id)}
                  sx={{ mr: 1 }}
                >
                  Update
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <Typography variant="body1">{post.text}</Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default Feed;
