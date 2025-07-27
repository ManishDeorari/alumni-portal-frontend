"use client";
import React, { useState, useRef, useEffect } from "react";
import ReplyBox from "../utils/ReplyBox";
import Picker from "@emoji-mart/react";
import socket from "../../../../utils/socket";
import { triggerReactionEffect } from "../hooks/useEmojiAnimation";

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
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [deleting, setDeleting] = useState(false);
  const heartRef = useRef(null);

  useEffect(() => {
    setReactions(comment.reactions || {});
  }, [comment.reactions]);

  const toggleReaction = async (emoji) => {
    try {
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

      const result = await res.json();
      const updatedComment = result.comment;

      if (updatedComment?.reactions) {
        setReactions(updatedComment.reactions);
      }

      socket.emit("updatePostRequest", { postId });
      triggerReactionEffect(emoji);
    } catch (err) {
      console.error("🔴 Reaction failed:", err);
    }
  };

  if (!comment || !currentUser || !comment.user) return null;

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
                  onClick={async () => {
                    setDeleting(true);
                    await onDelete(comment._id);
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

      {/* 🎉 Multiple Emoji Reactions */}
      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
        {["👍","❤️", "😂", "😮", "😢", "😊", "👏", "🎉"].map((emoji) => {
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
                    : "bg-gray-100 text-gray-600"
                } hover:scale-105`}
            >
              <span
                className={`text-[18px] ${
                  reacted ? "scale-110" : ""
                } transition-transform`}
              >
                {emoji}
              </span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 💬 Actions */}
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

      {showReplyBox && (
        <ReplyBox
          parentId={comment._id}
          onSubmit={(text) => {
            onReply(comment._id, text);
            setShowReplyBox(false);
          }}
        />
      )}

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
