"use client";
import React, { useState, useEffect, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function getEmojiFromUnified(unified) {
  return String.fromCodePoint(...unified.split("-").map((u) => "0x" + u));
}

export default function PostCard({ post, currentUser, setPosts }) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);

  const token = localStorage.getItem("token");
  const textareaRef = useRef(null);

  const toggleEdit = () => {
    setEditing((prev) => !prev);
    setShowEditEmoji(false);
  };

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const hasLiked = post.likes.includes(currentUser._id);
  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const getReactionCount = (emoji) =>
    post.reactions?.[emoji]?.length || 0;

  const userReacted = (emoji) =>
    post.reactions?.[emoji]?.includes(currentUser._id);

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
      toast.success("💬 Comment added");
    } catch (err) {
      toast.error("❌ Failed to add comment");
    }
  };

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;
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
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
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

  const editKey = `draft-${post._id}`;
    useEffect(() => {
      const saved = localStorage.getItem(editKey);
      if (saved && !post.content.includes(saved)) {
        setEditContent(saved);
      }
    }, []);

    useEffect(() => {
      if (editing && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [editing]);

    const handleBlurSave = () => {
      localStorage.setItem(editKey, editContent);
      toast("💾 Draft saved", { icon: "💾" });
    };

  const handleEditSave = async () => {
  if (!checkAuth() || !editContent.trim()) return alert("Content cannot be empty");
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
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    setEditing(false);
    setShowEditEmoji(false);
    localStorage.removeItem(editKey);
    toast.success("✏️ Post updated");
  } catch (err) {
    toast.error("❌ Failed to update post");
  }
};

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 3);
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePic || "/default-profile.png"}
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{post.user?.name || "Unknown"}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        {post.user?._id === currentUser._id && (
          <div className="ml-auto flex gap-2">
            <button onClick={toggleEdit} className="text-blue-600 text-sm hover:underline">
              {editing ? "Cancel" : "Edit"}
            </button>
            <button onClick={handleDelete} className="text-red-600 text-sm hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleBlurSave}
                rows={3}
                className="w-full border rounded p-2"
                placeholder="Edit your post..."
              />
              <div className="relative">
                <button
                  onClick={() => setShowEditEmoji(!showEditEmoji)}
                  className="text-xl"
                >
                  😊
                </button>
                {showEditEmoji && (
                  <div className="absolute z-50">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji) =>
                        setEditContent(editContent + getEmojiFromUnified(emoji.unified))
                      }
                    />
                  </div>
                )}
              </div>

              {/* 🔍 Live Preview */}
              <div className="p-2 border border-gray-300 rounded bg-gray-50">
                <p className="text-sm text-gray-500 font-semibold">Preview:</p>
                <p className="whitespace-pre-wrap">{editContent}</p>
              </div>

              <button
                onClick={handleEditSave}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-pre-wrap"
            >
              {post.content}
            </motion.p>
          )}
        </AnimatePresence>


      {/* Media */}
      {(post.image || post.video) && (
        <div className="mt-2">
          {post.image && (
            <img
              src={post.image}
              alt="post"
              width={600}
              height={400}
              className="rounded-lg max-h-96 w-full object-contain border"
            />
          )}
          {post.video && (
            <video controls className="rounded-lg w-full max-h-96 border mt-2">
              <source src={post.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-5 pt-2 border-t border-gray-300">
        <button
          onClick={handleLike}
          className={`font-semibold ${hasLiked ? "text-blue-600" : "text-gray-600"}`}
        >
          👍 Like ({post.likes.length})
        </button>
        <button
          onClick={() =>
            document.getElementById(`comment-input-${post._id}`)?.focus()
          }
          className="font-semibold text-gray-600"
        >
          💬 Comment ({post.comments.length})
        </button>
      </div>

      {/* Emoji Reactions */}
      <div className="flex gap-3 mt-2">
        {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`text-2xl ${userReacted(emoji) ? "scale-110" : ""} transition-transform`}
            title={userReacted(emoji) ? "You reacted" : `${getReactionCount(emoji)} reacted`}
          >
            {emoji} {getReactionCount(emoji) > 0 ? getReactionCount(emoji) : ""}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div className="space-y-2 pt-3 border-t border-gray-200 max-h-56 overflow-y-auto">
        {post.comments.slice(0, visibleComments).map((c) => (
          <div key={c._id} className="flex items-start gap-2">
            <Image
              src={c.user?.profilePic || "/default-profile.png"}
              alt="commenter"
              className="w-8 h-8 rounded-full mt-1"
              width={32}
              height={32}
            />
            <div>
              <p className="text-sm font-semibold">{c.user?.name}</p>
              <p>{c.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {post.comments.length > visibleComments && (
          <button onClick={handleLoadMore} className="text-sm text-blue-600">
            Load more comments
          </button>
        )}
      </div>

      {/* Comment Input */}
      <div className="pt-2 border-t border-gray-200 flex gap-2 items-center relative">
        <input
          id={`comment-input-${post._id}`}
          type="text"
          placeholder="Write a comment..."
          className="flex-grow border rounded px-3 py-1"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
        <button
          onClick={() => setShowCommentEmoji(!showCommentEmoji)}
          className="text-lg"
        >
          😊
        </button>
        {showCommentEmoji && (
          <div className="absolute bottom-10 right-0 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emoji) =>
                setComment(comment + getEmojiFromUnified(emoji.unified))
              }
            />
          </div>
        )}
        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
