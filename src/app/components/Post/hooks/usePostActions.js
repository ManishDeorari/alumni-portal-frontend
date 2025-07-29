import toast from "react-hot-toast";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "./useEmojiAnimation";

export default function usePostActions({
  post,
  setPosts,
  //token,
  setEditing,
}) {
  const token = localStorage.getItem("token");
  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
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

    if (!res.ok) throw new Error("Reaction failed");

    const updatedPost = await res.json();

    // ✅ Update this user's view optimistically
    setPosts((prev) =>
      prev.map((p) => (p._id === post._id ? updatedPost : p))
    );

    // ✅ Emit real-time event to others
    socket.emit("postReacted", updatedPost);

    // ✅ Trigger local reaction animation
    triggerReactionEffect(emoji);
  } catch (err) {
    console.error("Reaction Error:", err);
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
    toast.success("✏️ Post updated successfully", { autoClose: 1500 });
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
      toast.success("🗑️ Post deleted",{ autoClose: 1500 });
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
    handleReact,
    handleEditSave,
    handleDelete,
    handleBlurSave,
    toggleEdit,
  };
}
