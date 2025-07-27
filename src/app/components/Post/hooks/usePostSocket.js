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
