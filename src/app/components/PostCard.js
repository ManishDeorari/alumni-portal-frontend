"use client";
import React, { useState, useEffect, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import CommentCard from "./commentCard";
import socket from "../../utils/socket";

function getEmojiFromUnified(unified) {
  return String.fromCodePoint(...unified.split("-").map((u) => "0x" + u));
}

export default function PostCard({ post, currentUser, setPosts }) {
  const [comment, setComment] = useState("");
  const [replies, setReplies] = useState({});
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);
  const [reactionEffect, setReactionEffect] = useState(null);
  const [showThread, setShowThread] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const textareaRef = useRef(null);
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

  const hasLiked = (post.likes || []).includes(currentUser._id);

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
              <button onClick={() => setShowEditEmoji(!showEditEmoji)} className="text-xl">
                😊
              </button>
              {showEditEmoji && (
                <div className="absolute right-0 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji) =>
                      setEditContent(editContent + getEmojiFromUnified(emoji.unified))
                    }
                  />
                </div>
              )}
            </div>
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
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="whitespace-pre-wrap">{post.content}</p>
            <div
              onClick={() => setShowFullPost(true)}
              className="cursor-pointer text-sm text-blue-600 underline mt-1"
            >
              View full post
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media */}
      {(post.image || post.video) && (
        <div className="mt-2">
          {post.image && (
            <img
              src={post.image}
              alt="post"
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

      {/* Reaction Summary */}
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

      {/* Likes & Comments */}
      <div className="flex items-center gap-5 pt-2 border-t border-gray-300">
        <button
          onClick={handleLike}
          className={`font-semibold ${hasLiked ? "text-blue-600" : "text-gray-600"}`}
        >
          👍 Like ({(post.likes || []).length})
        </button>
        <button
          onClick={() => document.getElementById(`comment-input-${post._id}`)?.focus()}
          className="font-semibold text-gray-600"
        >
          💬 Comment ({(post.comments || []).length})
        </button>
      </div>

      {/* Emoji Reactions */}
      <div className="flex gap-3 mt-2">
        {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
          <motion.div
            key={emoji}
            className="relative flex items-center"
            onMouseEnter={() => setReactionEffect(emoji)}
            onMouseLeave={() => setReactionEffect(null)}
          >
            <motion.button
              whileTap={{ scale: 1.3 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleReact(emoji)}
              className={`text-2xl ${userReacted(emoji) ? "opacity-100" : "opacity-60"}`}
              title={userReacted(emoji) ? "You reacted" : `${getReactionCount(emoji)} reacted`}
            >
              {emoji} {getReactionCount(emoji) > 0 ? getReactionCount(emoji) : ""}
            </motion.button>
            {reactionEffect === emoji && (
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm px-2 py-1 bg-gray-800 text-white rounded shadow">
                {emoji}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Comments (Threaded View) */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        {(post.comments || []).slice(0, visibleComments).map((c) => (
          <CommentCard
            key={c._id}
            comment={c}
            currentUser={currentUser}
            onReply={handleReply}
            onDelete={handleDeleteComment}
            replies={c.replies || []}
          />
        ))}
        {(post.comments || []).length > visibleComments && (
          <button onClick={handleLoadMore} className="mt-2 text-sm text-blue-600">
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
          onChange={(e) => {
            setComment(e.target.value);
            socket.emit("typing", { postId: post._id, user: currentUser._id });
          }}
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />

        {someoneTyping && (
          <p className="text-sm text-gray-500 italic mt-1 animate-pulse">
            Someone is typing...
          </p>
        )}

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

      {/* Black Separator */}
      <hr className="my-6 border-black" />

      {/* Modal for Full Post View */}
      <AnimatePresence>
        {showFullPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowFullPost(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              >
                ✖
              </button>

              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
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
                  <button
                    onClick={toggleEdit}
                    className="ml-auto text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Post Content */}
              <p className="whitespace-pre-wrap mb-4">{post.content}</p>

              {/* Post Media */}
              {post.image && (
                <img
                  src={post.image}
                  alt="post"
                  className="rounded w-full max-h-[400px] object-contain border mb-4"
                />
              )}
              {post.video && (
                <video controls className="w-full max-h-[400px] border mb-4">
                  <source src={post.video} type="video/mp4" />
                </video>
              )}

              {/* Likes and Comments Count */}
              <div className="text-sm text-gray-600 flex gap-6 mb-3">
                <span>👍 {post.likes?.length || 0} Likes</span>
                <span>💬 {post.comments?.length || 0} Comments</span>
              </div>

              {/* Emoji Reactions */}
              <div className="flex gap-3 mb-4">
                {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                  <motion.div
                    key={emoji}
                    className="relative flex items-center"
                    onMouseEnter={() => setReactionEffect(emoji)}
                    onMouseLeave={() => setReactionEffect(null)}
                  >
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => handleReact(emoji)}
                      className={`text-2xl ${userReacted(emoji) ? "opacity-100" : "opacity-60"}`}
                      title={userReacted(emoji) ? "You reacted" : `${getReactionCount(emoji)} reacted`}
                    >
                      {emoji} {getReactionCount(emoji) > 0 ? getReactionCount(emoji) : ""}
                    </motion.button>
                    {reactionEffect === emoji && (
                      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm px-2 py-1 bg-gray-800 text-white rounded shadow">
                        {emoji}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Full Comment Thread */}
              <div className="space-y-3 border-t pt-3">
                {(post.comments || []).map((c) => (
                  <CommentCard
                    key={c._id}
                    comment={c}
                    currentUser={currentUser}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                    replies={c.replies || []}
                    showReplyCount
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}