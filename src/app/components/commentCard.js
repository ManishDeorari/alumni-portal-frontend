import React, { useState } from "react";
import ReplyBox from "./ReplyBox";

export default function CommentCard({ comment, currentUser, onReply, onDelete, replies = [] }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="pl-4 ml-2 border-l-2 border-gray-300 mt-2 space-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">{comment.user.name}</p>
          <p>{comment.text}</p>
          <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        {comment.user._id === currentUser._id && (
          <button onClick={() => onDelete(comment._id)} className="text-red-500 text-xs ml-2">
            Delete
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-blue-600 mt-1">
        <button onClick={() => setShowReplyBox((v) => !v)}>
          {showReplyBox ? "Cancel" : "Reply"}
        </button>
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies((prev) => !prev)}
            className="text-gray-500 hover:underline"
          >
            {showReplies ? `Hide ${replies.length} repl${replies.length > 1 ? "ies" : "y"}` : `Show ${replies.length} repl${replies.length > 1 ? "ies" : "y"}`}
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
              replies={r.replies || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
