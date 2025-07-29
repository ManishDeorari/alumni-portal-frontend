"use client";
import React, { useState, useRef, useEffect } from "react";
import ReplyBox from "../utils/ReplyBox";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "../hooks/useEmojiAnimation";
import { AnimatePresence, motion } from "framer-motion";

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
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState(2);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [deleting, setDeleting] = useState(false);

  const commentRef = useRef(null);
  const isOwn = comment.user?._id === currentUser._id;
  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    setReactions(comment.reactions || {});
  }, [comment.reactions]);

  useEffect(() => {
    if (isOwn && comment.justNow) {
      commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJustPosted(true);
      const timer = setTimeout(() => setJustPosted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [comment.justNow, isOwn]);

 const toggleReaction = async (emoji) => {
  if (isReply && onReactToReply) {
    // Use parent handler for replies
    return onReactToReply(comment.parentId || comment.parentCommentId, comment._id, emoji);
  }

  // ✅ Local logic for top-level comment
  try {
    const url = `https://alumni-backend-d9k9.onrender.com/api/posts/${postId}/comments/${comment._id}/react`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ emoji }),
    });

    if (!res.ok) throw new Error("Failed to react");

    const result = await res.json();
    setReactions(result.reactions || result.comment.reactions);

    socket.emit("updatePostRequest", { postId });
    triggerReactionEffect(emoji);
  } catch (err) {
    console.error("🔴 Reaction failed:", err);
  }
};

  if (!comment || !currentUser || !comment.user) return null;

  return (
    <div
      ref={commentRef}
      className={`mt-2 rounded-md space-y-2 py-2 px-2 relative transition-all duration-500
        ${
          isReply
            ? isOwn
              ? "bg-yellow-100 border border-yellow-400 pl-6 ml-3 border-l-[3px] border-blue-300"
              : "bg-white text-black border border-black pl-6 ml-3 border-l-[3px] border-blue-300"
            : isOwn
            ? "bg-yellow-50 border border-yellow-400"
            : "bg-white border border-black"
        }
        ${justPosted ? "ring-2 ring-yellow-400" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <p className="text-sm font-semibold flex items-center gap-1">
            {comment.user?.name || "Unknown"}
            {isOwn && (
              <span className="text-[10px] text-green-700 bg-green-100 px-1 rounded">
                You
              </span>
            )}
          </p>

          {editing ? (
            <div className="flex gap-1 items-start relative">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <EmojiPickerToggle
                show={showEmoji}
                onEmojiSelect={(emoji) => setEditText((prev) => prev + emoji.native)}
                positionClass="absolute top-10 left-40"
              />
            </div>
          ) : (
            <p>{comment.text}</p>
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

      {/* 👍 Reactions */}
      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
        {["👍", "❤️", "😂", "😮", "😢", "😊", "👏", "🎉"].map((emoji) => {
          const count = reactions?.[emoji]?.length || 0;
          const reacted =
            Array.isArray(reactions?.[emoji]) &&
            reactions[emoji].includes(currentUser._id);

          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 text-sm 
                ${
                  reacted
                    ? "bg-red-100 text-blue-600 font-semibold shadow-sm"
                    : "bg-gray-100 text-black-600 font-semibold shadow-sm"
                } hover:scale-105`}
            >
              <span className="text-[18px]">{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 💬 Actions */}
        <div className="flex items-center gap-3 text-xs text-blue-600 mt-1">
          {!isReply && (
            <button onClick={() => setShowReplyBox((v) => !v)}>
              {showReplyBox ? "Cancel" : "Reply"}
            </button>
          )}

          {replies.length > 0 && (
            <button
              onClick={() => {
                setShowReplies((prev) => !prev);
                setVisibleReplies(2);
              }}
              className="text-gray-500 hover:underline"
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