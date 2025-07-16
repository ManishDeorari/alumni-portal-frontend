import React, { useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css"; // Required CSS

export default function ReplyBox({ parentId, onSubmit }) {
  const [replyText, setReplyText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Simulated typing indicator

  const handleEmojiSelect = (emoji) => {
    setReplyText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleTyping = (e) => {
    setReplyText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      // You can emit socket event here: socket.emit("typing", { parentId });
      setTimeout(() => setIsTyping(false), 2000); // Reset after 2s of inactivity
    }
  };

  return (
    <div className="relative flex gap-2 mt-2 items-start">
      <input
        value={replyText}
        onChange={handleTyping}
        placeholder="Write a reply..."
        className="flex-grow border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-sm"
        title="Add Emoji"
      >
        😊
      </button>
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

      {showEmojiPicker && (
        <div className="absolute bottom-10 left-0 z-50">
          <Picker onSelect={handleEmojiSelect} theme="light" />
        </div>
      )}

      {isTyping && (
        <p className="text-xs text-gray-400 absolute -bottom-5 left-0 animate-pulse">
          Typing...
        </p>
      )}
    </div>
  );
}
