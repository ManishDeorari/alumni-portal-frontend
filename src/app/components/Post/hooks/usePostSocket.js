// components/Post/usePostSocket.js
import { useEffect } from "react";
import socket from "../../../../utils/socket";

export default function usePostSocket(postId, currentUser, setSomeoneTyping, setPosts) {
  useEffect(() => {
  if (!socket) return;

  const handleTyping = ({ postId: incomingId, user }) => {
    if (incomingId === postId && user !== currentUser._id) {
      setSomeoneTyping(true);
      setTimeout(() => setSomeoneTyping(false), 3000);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleCommentReacted = ({ postId: incomingId, commentId, userId }) => {
    if (incomingId !== postId) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== incomingId) return post;

        const updatedComments = post.comments.map((c) => {
          if (c._id !== commentId) return c;

          const already = c.reactions?.includes(userId);
          const updatedReactions = already
            ? c.reactions.filter((id) => id !== userId)
            : [...(c.reactions || []), userId];

          return { ...c, reactions: updatedReactions };
        });

        return { ...post, comments: updatedComments };
      })
    );
  };

  socket.on("typing", handleTyping);
  socket.on("postUpdated", handlePostUpdated);
  socket.on("commentReacted", handleCommentReacted);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("postUpdated", handlePostUpdated);
    socket.off("commentReacted", handleCommentReacted);
  };
}, [postId, currentUser._id, setSomeoneTyping, setPosts]);
}
