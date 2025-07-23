import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function usePostActions({
  post,
  currentUser,
  setPosts,
  token,
  setHasLiked,
  hasLiked, 
  setEditing,
  isLiking,         // ✅ Add this
  setIsLiking,      // ✅ And this
  triggerLikeAnimation,
}) {
  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  // ✅ Like handler with animation and toggle support
const handleLike = async () => {
  if (!checkAuth() || isLiking) return;

  setIsLiking(true);
  const userId = currentUser._id?.toString();

  try {
    const normalizeId = (id) => (typeof id === "object" ? id._id?.toString() : id?.toString?.());
    const wasLiked = post.likes.some((id) => normalizeId(id) === userId);

    // 🟣 Optimistic update
    const optimisticLikes = wasLiked
      ? post.likes.filter((id) => normalizeId(id) !== userId)
      : [...post.likes, userId];

    const tempPost = { ...post, likes: optimisticLikes };
    setHasLiked(!wasLiked);
    setPosts((prev) => prev.map((p) => (p._id === post._id ? tempPost : p)));

    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to like/unlike post");

    const updated = await res.json();
    const updatedLikes = updated.likes || [];
    const isNowLiked = updatedLikes.some((id) => normalizeId(id) === userId);

    // ✅ Update final like state and UI
    setHasLiked(isNowLiked);
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));

    // ✅ Animation only for like, not unlike
    if (isNowLiked && !wasLiked) {
      triggerLikeAnimation(true);
    }

    // ✅ Real-time socket emit
    socket.emit("postLiked", {
      postId: post._id,
      userId,
      isLiked: isNowLiked,
    });
  } catch (err) {
    console.error("Like failed:", err);
    toast.error("Failed to like post.");
  } finally {
    setTimeout(() => setIsLiking(false), 500); // 🧠 debounce/reset like lock
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
      //socket.emit("updatePost", updated);
      triggerReactionEffect(emoji);
    } catch (err) {
      toast.error("❌ Reaction failed");
    }
  };

  const handleEditSave = async (editContent) => {
  if (!checkAuth()) return;

  const contentToSave =
    typeof editContent === "string"
      ? editContent.trim()
      : editContent?.text?.trim?.() || "";

  if (!contentToSave) {
    toast.error("Content cannot be empty");
    return;
  }

  try {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: contentToSave }),
      }
    );
    const updated = await res.json();
    setEditing(false);
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    socket.emit("updatePost", updated);
  } catch (error) {
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
