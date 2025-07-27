import React, { useState } from "react";
import ReplyBox from "../utils/ReplyBox";
import Picker from "@emoji-mart/react";

export default function CommentCard({
  comment,
  currentUser,
  onReply,
  onDelete,
  onEdit,
  replies,
  postId,
}) {
  if (!comment || !currentUser) return null;

  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showEmoji, setShowEmoji] = useState(false);

  const toggleReaction = async () => {
    try {
      await fetch(`/api/posts/${postId}/comments/${comment._id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Reaction updates will be handled via socket
    } catch (err) {
      console.error("Reaction failed", err);
    }
  };

  return (
    <div className="pl-6 ml-3 border-l-[3px] border-blue-300 bg-blue-50 mt-2 rounded-md space-y-2 py-2 px-2 relative">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <p className="text-sm font-semibold">{comment.user?.name || "Unknown"}</p>

          {editing ? (
            <div className="flex gap-1 items-start">
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
                <div className="absolute z-10 top-10 left-40">
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

      {/* ❤️ Reactions */}
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
        <button onClick={toggleReaction} className="flex items-center gap-1">
          {comment.reactions?.includes(currentUser._id) ? (
            <span className="text-red-500">❤️</span>
          ) : (
            <span className="text-gray-400">🤍</span>
          )}
          {comment.reactions?.length > 0 && (
            <span className="text-xs text-gray-500">
              {comment.reactions.length}
            </span>
          )}
        </button>
      </div>

      {/* 🧵 Reply & Toggle */}
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
              ? `Hide ${replies.length} repl${replies.length > 1 ? "ies" : "y"}`
              : `Show ${replies.length} repl${replies.length > 1 ? "ies" : "y"}`}
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

      {/* 🔁 Replies */}
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
