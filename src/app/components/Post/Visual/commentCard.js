"use client";
import React, { useState, useRef, useEffect } from "react";
import ReplyBox from "../utils/ReplyBox";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "../hooks/useEmojiAnimation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";

export default function CommentCard({
  comment,
  currentUser,
  onReply,
  onDelete,
  onEdit,
  replies = [],
  postId,
  isReply = false,
  onEditReply,
  onDeleteReply,
  onReactToReply,
  darkMode = false
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState(2);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [deleting, setDeleting] = useState(false);
  const [showAbove, setShowAbove] = useState(true);
  const [pickerStyle, setPickerStyle] = useState({});

  const commentRef = useRef(null);
  const reactButtonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (showEmoji) {
      const handleClickOutside = (e) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target) &&
          reactButtonRef.current && !reactButtonRef.current.contains(e.target)) {
          setShowEmoji(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmoji]);

  const toggleEmojiPicker = () => {
    if (!showEmoji && reactButtonRef.current) {
      const rect = reactButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const style = {
        position: "fixed",
        zIndex: 9999,
        left: `${rect.left}px`,
        bottom: `${windowHeight - rect.top + 8}px`, // Forced Above
      };

      setPickerStyle(style);
    }
    setShowEmoji(!showEmoji);
  };

  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    setReactions(comment?.reactions || {});
  }, [comment?.reactions]);

  useEffect(() => {
    // Only scroll if it's the user's own new comment
    const isOwn = comment?.user?._id === currentUser?._id;
    if (isOwn && comment?.justNow) {
      commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJustPosted(true);
      const timer = setTimeout(() => setJustPosted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [comment?.justNow, comment?.user?._id, currentUser?._id]);

  // ✅ Safety check: early return if basic data is missing
  if (!comment || !currentUser || !comment.user) return null;

  const isOwn = comment.user._id === currentUser._id;

  const toggleReaction = async (emoji) => {
    if (isReply && onReactToReply) {
      // Use parent handler for replies
      return onReactToReply(comment.parentId || comment.parentCommentId, comment._id, emoji);
    }

    // ✅ Local logic for top-level comment
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/posts/${postId}/comments/${comment._id}/react`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.error || "Failed to react");
      }

      const result = await res.json();
      setReactions(result.reactions || result.comment.reactions);

      socket.emit("updatePostRequest", { postId });
      triggerReactionEffect(emoji);
    } catch (err) {
      console.error("🔴 Reaction failed:", err);
    }
  };

  return (
    <div
      ref={commentRef}
      className={`mt-2 rounded-xl space-y-2 py-3 px-3 relative transition-all duration-500 border
        ${isReply
          ? isOwn
            ? `${darkMode ? "bg-blue-500/10 border-blue-500/50" : "bg-yellow-100 border-black"} pl-6 ml-3 border-l-[3px] border-blue-500`
            : `${darkMode ? "bg-slate-800/50 border-white/20 text-gray-200" : "bg-white text-black border-black"} pl-6 ml-3 border-l-[3px] border-blue-300`
          : isOwn
            ? `${darkMode ? "bg-blue-600/10 border-blue-600/40" : "bg-yellow-50 border-black"}`
            : `${darkMode ? "bg-slate-800 border-white/20 text-gray-200" : "bg-white border-black"}`
        }
        ${justPosted ? "ring-2 ring-blue-400" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2 w-full">
          <Image
            src={comment.user?.profilePicture || "/default-profile.jpg"}
            alt="User"
            width={32}
            height={32}
            className={`w-8 h-8 rounded-full border ${darkMode ? "border-white/20" : "border-black"} object-cover mt-0.5`}
          />
          <div className="w-full">
            <div className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? "text-white" : ""}`}>
              {isOwn ? (
                <span>{comment.user?.name || "Unknown"}</span>
              ) : (
                <Link
                  href={`/dashboard/profile?id=${comment.user?._id}`}
                  className={`hover:underline ${darkMode ? "text-blue-400" : "text-blue-700"} cursor-pointer`}
                >
                  {comment.user?.name || "Unknown"}
                </Link>
              )}
              {isOwn && (
                <span className={`text-[10px] ${darkMode ? "text-blue-400 bg-blue-500/10" : "text-green-700 bg-green-100"} px-2 rounded-full font-bold`}>
                  You
                </span>
              )}
            </div>

            {editing ? (
              <div className="flex gap-1 items-start relative">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your comment..."
                  className={`w-full border ${darkMode ? "border-white/10 bg-slate-700 text-white" : "border-gray-200 bg-white text-gray-900"} rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none`}
                />
                <EmojiPickerToggle
                  onEmojiSelect={(emoji) => setEditText((prev) => prev + emoji.native)}
                  isCentered={true}
                  darkMode={darkMode}
                />
              </div>
            ) : (
              <p className={`${darkMode ? "text-gray-200" : "text-gray-800"}`}>{comment.text}</p>
            )}

            <p className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.editedAt && (
                <span className="ml-2 italic text-yellow-500">(edited)</span>
              )}
            </p>
          </div>

          {isOwn && (
            <div className="text-xs text-right space-y-1 ml-2">
              {editing ? (
                <>
                  <button
                    className="text-blue-600 font-semibold block"
                    onClick={() => {
                      if (isReply) {
                        onEditReply(comment.parentId, comment._id, editText); // ✅ Corrected
                      } else {
                        onEdit(comment._id, editText);
                      }
                      setEditing(false);
                      setShowEmoji(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="text-black-400 block"
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.text);
                      setShowEmoji(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="text-green-600 block"
                    onClick={() => {
                      setEditText(comment.text);
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      if (isReply) {
                        await onDeleteReply(comment.parentId, comment._id); // ✅ parentId is commentId
                      } else {
                        await onDelete(comment._id);
                      }
                      setDeleting(false);
                    }}
                    disabled={deleting}
                    className="text-red-500 block disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 👍 Reactions Summary */}
      {reactions && Object.keys(reactions).some(emoji => reactions[emoji]?.length > 0) && (
        <div className="flex gap-2 mt-1 flex-wrap">
          {Object.entries(reactions).map(([emoji, users]) => {
            if (!Array.isArray(users) || users.length === 0) return null;
            const reacted = users.includes(currentUser._id);
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all border 
                  ${reacted
                    ? (darkMode ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-400 text-blue-700")
                    : (darkMode ? "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200")}`}
              >
                <span>{emoji}</span>
                <span className="font-semibold">{users.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 💬 Actions */}
      <div className="flex items-center gap-4 text-xs mt-2 font-medium">
        {/* React Button */}
        <div className="relative">
          <button
            ref={reactButtonRef}
            onClick={toggleEmojiPicker}
            className={`${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"} font-bold transition flex items-center gap-1`}
          >
            👍 React
          </button>

          {showEmoji && createPortal(
            <div style={pickerStyle} className="fixed z-[9999]">
              <AnimatePresence>
                <motion.div
                  ref={pickerRef}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${darkMode ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"} border shadow-2xl rounded-full px-3 py-1.5 flex gap-2 ring-1 ring-black ring-opacity-5`}
                >
                  {["👍", "❤️", "😂", "😮", "😢", "😊", "👏", "🎉"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        toggleReaction(emoji);
                        // setShowEmoji(false); // Keep open until click outside
                      }}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>,
            document.body
          )}
        </div>

        {!isReply && (
          <button
            onClick={() => setShowReplyBox((v) => !v)}
            className={`${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"} font-bold transition`}
          >
            {showReplyBox ? "Cancel" : "Reply"}
          </button>
        )}

        {replies.length > 0 && (
          <button
            onClick={() => {
              setShowReplies((prev) => !prev);
              setVisibleReplies(2);
            }}
            className={`${darkMode ? "text-gray-500 hover:text-blue-400" : "text-gray-500 hover:underline"} font-bold`}
          >
            {showReplies
              ? `Hide ${replies.length} repl${replies.length > 1 ? "ies" : "y"}`
              : `Show ${replies.length} repl${replies.length > 1 ? "ies" : "y"}`}
          </button>
        )}
      </div>

      {/* ✏️ Reply Input */}
      {showReplyBox && (
        <ReplyBox
          parentId={comment._id}
          onSubmit={(text) => {
            onReply(comment._id, text);
            setShowReplyBox(false);
          }}
          darkMode={darkMode}
        />
      )}

      {/* 🧵 Animated, Indented Reply Threads */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            className="mt-2 space-y-2 ml-6"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {[...replies]
              .reverse()
              .slice(0, visibleReplies)
              .map((r) => (
                <CommentCard
                  key={r._id}
                  comment={r}
                  currentUser={currentUser}
                  onReply={onReply}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  replies={r.replies || []}
                  postId={postId}
                  isReply={true}
                  onEditReply={onEditReply}
                  onDeleteReply={onDeleteReply}
                  onReactToReply={onReactToReply}
                  darkMode={darkMode}
                />
              ))}

            {replies.length > visibleReplies && (
              <button
                className="text-blue-500 text-xs ml-4"
                onClick={() => setVisibleReplies((v) => v + 2)}
              >
                Load more replies
              </button>
            )}

            {visibleReplies > 2 && (
              <button
                className="text-red-400 text-xs ml-4"
                onClick={() => setVisibleReplies(2)}
              >
                Show less replies
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
