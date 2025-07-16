import React, { useState } from "react";

export default function ReplyBox({ parentId, onSubmit }) {
  const [replyText, setReplyText] = useState("");

  return (
    <div className="flex gap-2 mt-1">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-grow border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={() => {
          if (replyText.trim()) {
            onSubmit(replyText.trim());
            setReplyText("");
          }
        }}
        className="text-sm text-blue-600 font-semibold"
      >
        Send
      </button>
    </div>
  );
}
