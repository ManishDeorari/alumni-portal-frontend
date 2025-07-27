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

    const handleCommentReacted = ({ postId: incomingId, commentId, userId, emoji }) => {
  if (incomingId !== postId){ return;}

setPosts((prevPosts) =>
  prevPosts.map((post) => {
    if (post._id !== incomingId) return post;

    const updatedComments = post.comments.map((comment) => {
      if (comment._id !== commentId) return comment;

      // ensure reactions exist
      const reactions = { ...(comment.reactions || {}) };
      const usersForEmoji = new Set(reactions[emoji] || []);

      if (usersForEmoji.has(userId)) {
        usersForEmoji.delete(userId); // undo
      } else {
        usersForEmoji.add(userId); // react
      }

      reactions[emoji] = Array.from(usersForEmoji);
      return { ...comment, reactions };
    });

    return { ...post, comments: updatedComments };
  })
); };

    const handleUpdatePostRequest = async ({ postId: incomingId }) => {
      try {
        if (incomingId !== postId) return;
        const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/posts/${incomingId}`);
        const post = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === incomingId ? post : p)));
      } catch (err) {
        console.error("🔴 Failed to sync post", err);
      }
    };

    // ✅ Attach listeners
    socket.on("typing", handleTyping);
    socket.on("commentReacted", handleCommentReacted);
    socket.on("updatePostRequest", handleUpdatePostRequest);

    // ✅ Clean up on unmount
    return () => {
      socket.off("typing", handleTyping);
      socket.off("commentReacted", handleCommentReacted);
      socket.off("updatePostRequest", handleUpdatePostRequest);
    };
  }, [postId, currentUser._id, setSomeoneTyping, setPosts]);
}
