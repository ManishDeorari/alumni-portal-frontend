// components/PostCard/hooks/usePostEffects.js
import { useEffect, useRef } from "react";

export default function usePostEffects({
  post,
  currentUser,
  setEditContent,
  setHasLiked,
  editing,
  textareaRef,
  setSomeoneTyping,
  setPosts,
}) {
  const postRef = useRef(null); // ✅ This will be used to highlight or scroll the post

  const editKey = `draft-${post._id}`;

  // ✅ Restore local draft content
  useEffect(() => {
    const saved = localStorage.getItem(editKey);
    if (saved && !post.content.includes(saved)) {
      setEditContent(saved);
    }
  }, []);

  // ✅ Set liked state on mount and whenever likes change
  useEffect(() => {
    const userId = currentUser._id?.toString();
    const normalizeId = (id) =>
      typeof id === "object" ? id._id?.toString() : id?.toString?.();

    const liked = post.likes?.some((id) => normalizeId(id) === userId);
    setHasLiked(liked);
  }, [post.likes, currentUser._id]);

  // ✅ Auto-scroll user’s own post into view on load
  useEffect(() => {
    if (post.user?._id === currentUser?._id && postRef.current) {
      postRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // ✅ Auto-focus edit textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  // ✅ Like animation from other users via socket
  useEffect(() => {
    const socket = require("../../../../utils/socket").default;
    const handleLikeAnimation = ({ postId, userId, isLiked }) => {
      if (postId === post._id && userId !== currentUser._id) {
        const ids = [`like-icon-${post._id}`, `like-icon-${post._id}-modal`];
        ids.forEach((id) => {
          const icon = document.getElementById(id);
          if (icon) {
            icon.classList.add(isLiked ? "animate-like" : "animate-unlike");
            setTimeout(() => {
              icon.classList.remove("animate-like", "animate-unlike");
            }, 500);
          }
        });
      }
    };
    socket.on("postLiked", handleLikeAnimation);
    return () => socket.off("postLiked", handleLikeAnimation);
  }, [post._id, currentUser._id]);

  return postRef; // ✅ Export this so PostCard can attach it to its wrapper
}
