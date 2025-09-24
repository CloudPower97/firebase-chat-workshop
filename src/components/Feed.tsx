import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import type { Post } from "../types/post";
import { formatDistanceToNow } from "date-fns";

function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

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
                alt={`${post.author.displayName} ${post.author.surname}`}
                src={post.author.avatar || undefined}
              />
            }
            title={`${post.author.displayName} ${post.author.surname}`}
            subheader={
              post.createdAt
                ? formatDistanceToNow(post.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : "Just now"
            }
          />
          <CardContent>
            <Typography variant="body1">{post.text}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default Feed;
