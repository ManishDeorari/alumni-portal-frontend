// components/PostCard/hooks/usePostEffects.js
import { useEffect } from "react";

export default function usePostEffects({ post, currentUser, setEditContent, setHasLiked, editing, textareaRef, setSomeoneTyping, setPosts }) {
  const editKey = `draft-${post._id}`;

  useEffect(() => {
    const saved = localStorage.getItem(editKey);
    if (saved && !post.content.includes(saved)) {
      setEditContent(saved);
    }
  }, []);

  useEffect(() => {
  const userId = currentUser._id?.toString();
  const normalizeId = (id) =>
    typeof id === "object" ? id._id?.toString() : id?.toString?.();

  const liked = post.likes?.some((id) => normalizeId(id) === userId);
  setHasLiked(liked);
}, [post.likes, currentUser._id]);


  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    const socket = require("../../../../utils/socket").default;
    const handleLikeAnimation = ({ postId, userId, isLiked }) => {
      if (postId === post._id && userId !== currentUser._id) {
        const icon = document.querySelector(`#like-icon-${post._id}`);
        if (icon) {
          icon.classList.add(isLiked ? "animate-like" : "animate-unlike");
          setTimeout(() => {
            icon.classList.remove("animate-like", "animate-unlike");
          }, 500);
        }
      }
    };
    socket.on("postLiked", handleLikeAnimation);
    return () => socket.off("postLiked", handleLikeAnimation);
  }, [post._id, currentUser._id]);

  useEffect(() => {
  const socket = require("../../../../utils/socket").default;

  const handleReactionUpdate = ({ postId, reactions }) => {
    if (postId === post._id) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, reactions } : p
        )
      );
    }
  };

  socket.on("postReacted", handleReactionUpdate);
  return () => socket.off("postReacted", handleReactionUpdate);
}, [post._id]);

}
