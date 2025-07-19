"use client";
import React, { useState, useEffect, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Subcomponents
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMedia from "./PostMedia";
import PostReactions from "./PostReactions";
import PostModal from "./PostModal";
import CommentInput from "./CommentInput";
import CommentCard from "./commentCard";
import FullImageViewer from "./FullImageViewer";

import socket from "../../../utils/socket";

function getEmojiFromUnified(unified) {
  return String.fromCodePoint(...unified.split("-").map((u) => "0x" + u));
}

export default function PostCard({ post, currentUser, setPosts }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [comment, setComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleComments, setVisibleComments] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [showThread, setShowThread] = useState(false);

  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const editKey = `draft-${post._id}`;

  useEffect(() => {
    const saved = localStorage.getItem(editKey);
    if (saved && !post.content.includes(saved)) {
      setEditContent(saved);
    }
  }, []);

  useEffect(() => {
    setHasLiked(post.likes?.includes(currentUser._id));
  }, [post.likes, currentUser._id]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (!socket) return;

    socket.on("postUpdated", (updatedPost) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    return () => {
      socket.off("postUpdated");
    };
  }, [socket, setPosts]);

  useEffect(() => {
    socket.on("typing", ({ postId, user }) => {
      if (postId === post._id && user !== currentUser._id) {
        setSomeoneTyping(true);
        setTimeout(() => setSomeoneTyping(false), 3000);
      }
    });
    return () => socket.off("typing");
  }, [post._id]);

  const toggleEdit = () => {
    setEditing((prev) => !prev);
    setShowEditEmoji(false);
  };

  const getReactionCount = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.length : 0;
  };

  const userReacted = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.includes(currentUser._id) : false;
  };

  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const openImage = (i) => {
    setStartIndex(i);
    setShowViewer(true);
  };

  const triggerReactionEffect = (emoji) => {
    const container = document.createElement("div");
    container.className = "fixed text-3xl pointer-events-none z-50";
    container.style.left = `${Math.random() * 80 + 10}%`;
    container.style.top = "70%";
    container.textContent = emoji;

    document.body.appendChild(container);

    const animation = container.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(-100px)", opacity: 0 }
      ],
      {
        duration: 1000,
        easing: "ease-out"
      }
    );

    animation.onfinish = () => container.remove();
  };

  const handleLike = async () => {
    if (!checkAuth()) return;
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    socket.emit("updatePost", updated);
  };

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;
    const action = userReacted(emoji) ? "remove" : "add";
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/react`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji, action }),
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    triggerReactionEffect(emoji);
    socket.emit("updatePost", updated);
  };

  const handleComment = async () => {
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
      setComment("");
      setShowCommentEmoji(false);
      setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
      socket.emit("updatePost", updated);
      toast.success("💬 Comment added");
    } catch (err) {
      toast.error("❌ Failed to add comment");
    }
  };

  const handleReply = async (parentCommentId, replyText) => {
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
      setPosts((prev) => prev.map((p) => p._id === post._id ? updated : p));
      socket.emit("updatePost", updated);
    } catch (err) {
      toast.error("❌ Failed to reply");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => p._id === post._id ? updated : p));
      socket.emit("updatePost", updated);
    } catch (err) {
      toast.error("❌ Failed to delete comment");
    }
  };

  const handleEditSave = async () => {
  if (!checkAuth() || !editContent.trim()) return;

  try {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "PUT",
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


  const handleEditComment = async (commentId, newText) => {
  if (!checkAuth() || !newText.trim()) {
    return alert("Comment cannot be empty");
  }

  try {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/comments/${commentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      }
    );

    const updatedComment = await res.json();

    // Update comment inside posts
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === post._id
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c._id === commentId ? updatedComment : c
              ),
            }
          : p
      )
    );

    toast.success("✏️ Comment updated");
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to update comment");
  }
};

  const handleDelete = async () => {
    if (!checkAuth() || !confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("🗑️ Post deleted");
    } catch (err) {
      toast.error("❌ Failed to delete post");
    }
  };

  const handleBlurSave = () => {
    localStorage.setItem(editKey, editContent);
    toast("💾 Draft saved", { icon: "💾" });
  };

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 3);
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-3 relative">
      <PostHeader {...{ post, currentUser, editing, toggleEdit, handleDelete }} />

      <PostContent
        {...{
          post,
          editing,
          editContent,
          setEditContent,
          handleEditSave,
          handleBlurSave,
          showEditEmoji,
          setShowEditEmoji,
          textareaRef,
          getEmojiFromUnified,
          setShowModal,
        }}
      />

      <PostMedia
          post={post}
          setSelectedImage={(index) => {
            setStartIndex(index);
            setShowViewer(true);
          }}
        />

      {post.reactions && Object.keys(post.reactions || {}).length > 0 && (
        <div className="flex gap-3 mt-1 flex-wrap">
          {Object.entries(post.reactions || {}).map(([emoji, users]) => {
            if (!Array.isArray(users) || users.length === 0) return null;
            return (
              <div
                key={emoji}
                className={`text-lg px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1 ${
                  userReacted(emoji) ? "border border-blue-500 bg-blue-50" : ""
                }`}
              >
                {emoji} <span className="text-sm text-gray-600">x{users.length}</span>
              </div>
            );
          })}
        </div>
      )}

      <PostReactions
        {...{
          post,
          hasLiked,
          handleLike,
          handleReact,
          userReacted,
          getReactionCount,
          setShowModal,
        }}
      />

      <div className="pt-2 border-t border-gray-200 space-y-2">
        {(post.comments || []).slice(0, visibleComments).map((c) => (
          <CommentCard
            key={c._id}
            comment={c}
            currentUser={currentUser}
            onReply={handleReply}
            onDelete={handleDeleteComment}
            onEdit={handleEditComment}
            replies={c.replies || []}
          />
        ))}
        {(post.comments || []).length > visibleComments && (
          <button onClick={handleLoadMore} className="mt-2 text-sm text-blue-600">
            Load more comments
          </button>
        )}
      </div>

      <CommentInput
        {...{
          post,
          currentUser,
          comment,
          setComment,
          handleComment,
          showCommentEmoji,
          setShowCommentEmoji,
          data,
          getEmojiFromUnified,
          socket,
          someoneTyping,
        }}
      />

      <hr className="my-6 border-black" />

      <AnimatePresence>
        {showModal && (
          <PostModal
            {...{
              post,
              currentUser,
              showModal,
              setShowModal,
              toggleEdit,
              handleReact,
              userReacted,
              getReactionCount,
              showThread,
              setShowThread,
              handleReply,
              handleDeleteComment,
              // ✅ ADD THESE for FullImageViewer support
              setShowViewer,
              setStartIndex,
            }}
          />
        )}
      </AnimatePresence>

      {showViewer && (
        <FullImageViewer
          images={post.images}
          startIndex={startIndex}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}
