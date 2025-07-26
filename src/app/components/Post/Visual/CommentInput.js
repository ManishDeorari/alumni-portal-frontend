"use client";
import React, { useRef, useEffect } from "react";
import { FaSmile } from "react-icons/fa";
import EmojiPicker from "../utils/EmojiPickerToggle";

export default function CommentInput({
  comment,
  setComment,
  onEmojiClick,
  onSubmit,
  showCommentEmoji,
  setShowCommentEmoji,
  typing,
  isTyping,
}) {
  const inputRef = useRef(null);
  const emojiRef = useRef(null);

  // Hide emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setShowCommentEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowCommentEmoji]);

  // ✅ Fix emoji insert directly into comment box
  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + emojiObject.emoji);
    setShowCommentEmoji(false);
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

        <button
          type="button"
          onClick={() => setShowCommentEmoji(!showCommentEmoji)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaSmile size={18} />
        </button>

        {/* ✅ Comment Submit */}
        <button
          onClick={onSubmit}
          className="ml-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-600"
        >
          Post
        </button>
      </div>

      {/* ✅ Emoji Picker */}
      {showCommentEmoji && (
        <div ref={emojiRef} className="absolute right-0 z-50 mt-2">
          <EmojiPicker onEmojiClick={(e, emojiObject) => handleEmojiClick(emojiObject)} />
        </div>
      )}

      {/* Typing Indicator */}
      {typing && (
        <p className="text-xs text-gray-400 mt-1 ml-2 italic">Someone is typing...</p>
      )}
    </div>
  );
}
