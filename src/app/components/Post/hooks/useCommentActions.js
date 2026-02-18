import { useCallback } from "react";
import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function useCommentActions({
  post,
  currentUser,
  setPosts,
  setComment,
  setShowCommentEmoji
}) {
  const token = localStorage.getItem("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const checkAuth = useCallback(() => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  }, [token]);

  const handleComment = useCallback(
    async (comment) => {
      if (!checkAuth() || !comment.trim()) return;

      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment`,
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
    [post._id, setPosts, setComment, setShowCommentEmoji, API_URL, token, checkAuth]
  );

  const handleReply = useCallback(
    async (parentCommentId, replyText) => {
      if (!checkAuth() || !replyText.trim()) {
        toast.error("Reply cannot be empty");
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment/${parentCommentId}/reply`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: replyText }),
          }
        );

        const updated = await res.json();

        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? updated : p))
        );

        socket.emit("updatePost", updated);
        toast.success("💬 Reply posted!", { autoClose: 1500 });
      } catch (err) {
        console.error("❌ handleReply error:", err);
        toast.error("❌ Failed to reply");
      }
    },
    [post._id, setPosts, API_URL, token, checkAuth]
  );

  const handleEditComment = useCallback(
    async (commentId, newText) => {
      if (!checkAuth() || !newText.trim()) {
        return alert("Comment cannot be empty");
      }

      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment/${commentId}`,
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
    [post._id, setPosts, API_URL, token, checkAuth]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment/${commentId}`,
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
    [post._id, setPosts, API_URL, token]
  );

  const handleEditReply = useCallback(
    async (commentId, replyId, newText) => {
      if (!checkAuth() || !newText.trim()) return alert("Reply cannot be empty");

      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment/${commentId}/reply/${replyId}`,
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
        setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
        socket.emit("postUpdated", updated);
        toast.success("✏️ Reply updated", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to edit reply");
      }
    },
    [post._id, setPosts, API_URL, token, checkAuth]
  );

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    try {
      const res = await fetch(
        `${API_URL}/api/posts/${post._id}/comment/${commentId}/reply/${replyId}`,
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
      toast.success("🗑️ Reply deleted!", { autoClose: 1500 });
    } catch (err) {
      console.error("❌ Failed to delete reply:", err);
      toast.error("❌ Failed to delete reply");
    }
  }, [post._id, setPosts, API_URL, token]);

  const handleReactToReply = useCallback(
    async (commentId, replyId, emoji) => {
      try {
        const res = await fetch(
          `${API_URL}/api/posts/${post._id}/comment/${commentId}/reply/${replyId}/react`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ emoji }),
          }
        );

        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
        socket.emit("postUpdated", updated);
        triggerReactionEffect(emoji);
        //toast.success("👍 Reply reaction updated", { autoClose: 1500 });
      } catch (err) {
        toast.error("❌ Failed to react to reply");
      }
    },
    [post._id, setPosts, API_URL, token]
  );

  return {
    handleComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
    handleEditReply,
    handleDeleteReply,
    handleReactToReply,
  };

}
