"use client";
import React, { useState } from "react";
import ReplyBox from "../utils/ReplyBox";
import Picker from "@emoji-mart/react";
import socket from "../../../../utils/socket";

export default function CommentCard({
  comment,
  currentUser,
  onReply,
  onDelete,
  onEdit,
  replies = [],
  postId,
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [localReactions, setLocalReactions] = useState(comment.reactions || {});

  if (!comment || !currentUser || !comment.user) return null;

  // ✅ Toggle emoji reaction
  const toggleReaction = async (emoji = "❤️") => {
    try {
      // Optimistic UI update
      const updated = { ...localReactions };
      const users = updated[emoji]?.map((id) => id.toString()) || [];

      const alreadyReacted = users.includes(currentUser._id.toString());

      if (alreadyReacted) {
        // Remove user from reaction
        updated[emoji] = users.filter(
          (id) => id !== currentUser._id.toString()
        );
      } else {
        // Add user to reaction
        updated[emoji] = [...users, currentUser._id.toString()];
      }

      setLocalReactions(updated); // update UI immediately

      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${postId}/comments/${comment._id}/react`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!res.ok) throw new Error("Failed to react");

      // Real update from server via socket
      const updatedPost = await res.json();
      socket.emit("updatePostRequest", { postId });
    } catch (err) {
      console.error("🔴 Reaction failed:", err);
    }
  };

  return (
    <div className="pl-6 ml-3 border-l-[3px] border-blue-300 bg-blue-50 mt-2 rounded-md space-y-2 py-2 px-2 relative">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <p className="text-sm font-semibold">
            {comment.user?.name || "Unknown"}
          </p>

          {editing ? (
            <div className="flex gap-1 items-start relative">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => setShowEmoji((prev) => !prev)}
                className="text-xl"
              >
                😊
              </button>
              {showEmoji && (
                <div className="absolute z-50 top-10 left-40">
                  <Picker
                    onEmojiSelect={(emoji) =>
                      setEditText((prev) => prev + emoji.native)
                    }
                    theme="light"
                  />
                </div>
              )}
            </div>
          ) : (
            <p>{comment.text}</p>
          )}

          <p className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ✏️ Owner controls */}
        {comment.user?._id === currentUser._id && (
          <div className="text-xs text-right space-y-1 ml-2">
            {editing ? (
              <>
                <button
                  className="text-blue-600 font-semibold block"
                  onClick={() => {
                    onEdit(comment._id, editText);
                    setEditing(false);
                    setShowEmoji(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="text-gray-400 block"
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
                  onClick={() => onDelete(comment._id)}
                  className="text-red-500 block"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ❤️ Emoji Reactions */}
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 flex-wrap">
        {localReactions &&
          Object.entries(localReactions).map(([emoji, users]) => {
            const reacted = users.some(
              (id) => id.toString() === currentUser._id.toString()
            );
            const count = users.length;

            if (count === 0) return null; // skip if nobody reacted

            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`flex items-center gap-1 rounded px-1 ${
                  reacted ? "bg-red-100" : "hover:bg-gray-100"
                }`}
              >
                <span className={reacted ? "text-red-500" : "text-gray-500"}>
                  {emoji}
                </span>
                <span className="text-xs text-gray-500">{count}</span>
              </button>
            );
          })}

        {/* ➕ Default Add Reaction (❤️) */}
        <button
          onClick={() => toggleReaction("❤️")}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          + React
        </button>
      </div>

      {/* 🧵 Reply actions */}
      <div className="flex items-center gap-3 text-xs text-blue-600 mt-1">
        <button onClick={() => setShowReplyBox((v) => !v)}>
          {showReplyBox ? "Cancel" : "Reply"}
        </button>
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies((prev) => !prev)}
            className="text-gray-500 hover:underline"
          >
            {showReplies
              ? `Hide ${replies.length} repl${
                  replies.length > 1 ? "ies" : "y"
                }`
              : `Show ${replies.length} repl${
                  replies.length > 1 ? "ies" : "y"
                }`}
          </button>
        )}
      </div>

      {/* 💬 Reply Box */}
      {showReplyBox && (
        <ReplyBox
          parentId={comment._id}
          onSubmit={(text) => {
            onReply(comment._id, text);
            setShowReplyBox(false);
          }}
        />
      )}

      {/* 🔁 Nested Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((r) => (
            <CommentCard
              key={r._id}
              comment={r}
              currentUser={currentUser}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              replies={r.replies || []}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
