import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function usePostActions({
  post,
  currentUser,
  setPosts,
  token,
  setHasLiked,
  setEditing,
}) {
  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const handleLike = async (isLiking, setIsLiking) => {
    if (!checkAuth() || isLiking) return;

    setIsLiking(true);
    try {
      const wasLiked = post.likes.includes(currentUser._id);
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updated = await res.json();
      const isNowLiked = updated.likes.includes(currentUser._id);

      setHasLiked(isNowLiked);
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updated : p))
      );

      socket.emit("postLiked", {
        postId: post._id,
        userId: currentUser._id,
        isLiked: isNowLiked,
      });
    } catch (err) {
      console.error("Like failed:", err);
      toast.error("Failed to like post.");
    } finally {
      setTimeout(() => setIsLiking(false), 500);
    }
  };

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/react`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, reactions: updated.reactions } : p
        )
      );
      socket.emit("updatePost", updated);
      triggerReactionEffect(emoji);
    } catch (err) {
      toast.error("❌ Reaction failed");
    }
  };

  const handleEditSave = async () => {
  if (!checkAuth() || !editContent.trim()) return;

  try {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const updated = await res.json();
    setEditing(false);
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    socket.emit("updatePost", updated);
    toast.success("✅ Post updated");
  } catch (error) {
    console.error("Error editing post:", error?.message || error); // 👈 LOG ERROR
    toast.error("❌ Failed to update post");
  }
};

  const handleDelete = async () => {
    if (!checkAuth()) return;
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await res.json();
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("🗑️ Post deleted");
    } catch (err) {
      toast.error("❌ Failed to delete post");
    }
  };

  const handleBlurSave = (editContent, editKey) => {
    localStorage.setItem(editKey, editContent);
    toast("💾 Draft saved", { icon: "💾" });
  };

const toggleEdit = (editKey, setEditContent, editing, originalContent) => {
  if (editing) {
    // Cancel editing
    setEditing(false);
    setEditContent(originalContent);
    localStorage.removeItem(editKey);
    return;
  }

  const draft = localStorage.getItem(editKey);
  if (draft) {
    const confirmed = confirm(
      "You have an unsaved draft. Load it and continue editing?"
    );
    if (confirmed) {
      setEditContent(draft);
    } else {
      localStorage.removeItem(editKey);
    }
  }
  setEditing(true);
};

  return {
    handleLike,
    handleReact,
    handleEditSave,
    handleDelete,
    handleBlurSave,
    toggleEdit,
  };
}
