import { Box, Button, TextField, Typography } from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { db } from "../firebase";

function CreatePost() {
  const [text, setText] = useState("");
  const appContext = useContext(AppContext);

  const handleCreatePost = async () => {
    if (!appContext || !appContext.me) {
      return;
    }

    if (text.trim() === "") {
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        author: {
          email: appContext.me.email,
          name: appContext.me.name,
          surname: appContext.me.surname,
          avatar: appContext.me.avatar,
        },
        text: text,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create a new Post
      </Typography>
      <TextField
        label="What's on your mind?"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Button variant="contained" onClick={handleCreatePost}>
        Post
      </Button>
    </Box>
  );
}

export default CreatePost;
