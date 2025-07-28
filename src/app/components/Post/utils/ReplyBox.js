import React, { useState } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function ReplyBox({ parentId, onSubmit }) {
  const [replyText, setReplyText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  return (
    <div className="relative flex gap-2 mt-2 items-start w-full">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-grow border rounded px-2 py-1 text-sm"
      />
      <EmojiPickerToggle
        show={showEmoji}
        onEmojiSelect={(emoji) =>
          setReplyText((prev) => prev + emoji.native)
        }
        onToggle={() => setShowEmoji((prev) => !prev)}
        positionClass="absolute top-10 left-2"
      />
      <button
        onClick={() => {
          if (replyText.trim()) {
            onSubmit(replyText.trim());
            setReplyText("");
            setShowEmoji(false);
          }
        }}
        className="text-sm text-blue-600 font-semibold"
      >
        Send
      </button>
    </div>
  );
}
