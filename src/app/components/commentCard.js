import React, { useState } from "react";
import ReplyBox from "./ReplyBox";

export default function CommentCard({ comment, currentUser, onReply, onDelete, replies = [] }) {
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <div className="pl-4 border-l ml-2 mt-2 space-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">{comment.user.name}</p>
          <p>{comment.text}</p>
          <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        {comment.user._id === currentUser._id && (
          <button onClick={() => onDelete(comment._id)} className="text-red-500 text-xs">Delete</button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
        <button onClick={() => setShowReplyBox((v) => !v)}>Reply</button>
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

      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((r) => (
            <CommentCard
              key={r._id}
              comment={r}
              currentUser={currentUser}
              onReply={onReply}
              onDelete={onDelete}
              replies={r.replies}
            />
          ))}
        </div>
      )}
    </div>
  );
}
