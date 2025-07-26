"use client";
import React, { useRef } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function CommentInput({
  comment,
  setComment,
  onSubmit,
  typing,
  isTyping,
}) {
  const inputRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + emojiObject.native || emojiObject.emoji); // emoji-mart v3/v5 support
  };

  return (
    <div className="relative mt-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            isTyping(e.target.value.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
          ref={inputRef}
        />

        {/* ✅ Working Emoji Picker Button */}
        <div className="absolute bottom-[120%] right-[120px] z-50">
              <EmojiPickerToggle
                onEmojiSelect={handleEmojiClick}
                icon="😀"
                iconSize="text-2xl"
              />
            </div>

        <button
          onClick={onSubmit}
          className="ml-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-600"
        >
          Post
        </button>
      </div>

      {/* Typing Indicator */}
      {typing && (
        <p className="text-xs text-gray-400 mt-1 ml-2 italic">
          Someone is typing...
        </p>
      )}
    </div>
  );
}
