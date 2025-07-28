import { useCallback } from "react";
import toast from "react-hot-toast";
import socket from "../../../../utils/socket";

export default function useCommentActions({
  post,
  currentUser,
  setPosts,
  setComment,
  setShowCommentEmoji
}) {
  const token = localStorage.getItem("token");

  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const handleComment = useCallback(
    async (comment) => {
      if (!checkAuth() || !comment.trim()) return;

      try {
        const res = await fetch(
          `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: comment }),
          }
        );

        const updated = await res.json();
        if (setComment) setComment("");
        if (setShowCommentEmoji) setShowCommentEmoji(false);

        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? updated : p))
        );

        socket.emit("updatePost", updated);
        toast.success("💬 Comment posted!", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to add comment");
      }
    },
    [post._id, setPosts, setComment, setShowCommentEmoji]
  );

  const handleReply = useCallback(
    async (parentCommentId, replyText) => {
      try {
        const res = await fetch(
          `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment/reply`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ parentCommentId, text: replyText }),
          }
        );
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? updated : p))
        );
        socket.emit("updatePost", updated);
      } catch (err) {
        toast.error("❌ Failed to reply");
      }
    },
    [post._id, setPosts]
  );

  const handleEditComment = useCallback(
    async (commentId, newText) => {
      if (!checkAuth() || !newText.trim()) {
        return alert("Comment cannot be empty");
      }

      try {
        const res = await fetch(
          `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment/${commentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: newText }),
          }
        );

        const updated = await res.json();

        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? updated : p))
        );

        socket.emit("updatePost", updated);
        toast.success("✏️ Comment updated", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to update comment");
      }
    },
    [post._id, setPosts]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        const res = await fetch(
          `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment/${commentId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? updated : p))
        );
        socket.emit("updatePost", updated);
        toast.success("🗑️ Comment deleted!", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to delete comment");
      }
    },
    [post._id, setPosts]
  );

  return {
    handleComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
  };
}
