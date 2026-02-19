"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Emoji to label mapping
const emojiLabels = {
  "👍": "Like",
  "❤️": "Love",
  "😂": "Funny",
  "😮": "Wow",
  "😢": "Sad",
  "😊": "Happy",
  "👏": "Clap",
  "🎉": "Celebrate",
};

export default function PostReactions({
  post,
  handleReact,
  getReactionCount,
  userReacted,
  setReactionEffect,
  reactionEffect,
  showComments,
  setShowComments,
  darkMode = false
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const [pickerStyle, setPickerStyle] = useState({});
  const pickerRef = useRef();
  const buttonRef = useRef();

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle dynamic position of emoji picker
  const handleEmojiButtonClick = () => {
    if (!showEmojiPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      setPickerStyle({
        position: "fixed",
        zIndex: 99999,
        left: `${rect.left}px`,
        bottom: `${viewportHeight - rect.top + 8}px`,
      });
    }
    setShowEmojiPicker((prev) => !prev);
  };

  return (
    <>
      {/* Reactions Summary */}
      {post.reactions && Object.keys(post.reactions).length > 0 && (
        <div className="flex gap-3 mt-1 flex-wrap">
          {Object.entries(post.reactions).map(([emoji, users]) => {
            if (!Array.isArray(users) || users.length === 0) return null;
            return (
              <div
                key={emoji}
                className={`text-lg px-2 py-1 ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-100"} border rounded-full flex items-center gap-1 ${userReacted(emoji)
                  ? (darkMode ? "border-blue-500 bg-blue-500/10" : "border-blue-500 bg-blue-50")
                  : ""
                  }`}
              >
                {emoji}
                <span className="text-sm text-gray-600">x{users.length}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* React + Comment Buttons */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between">
          {/* React Button (left) */}
          <button
            onClick={handleEmojiButtonClick}
            className={`font-semibold text-base ${darkMode ? "text-gray-400" : "text-gray-600"} hover:underline transition flex items-center gap-1`}
            ref={buttonRef}
          >
            👍 React
          </button>

          {/* Comment Button (right, slightly left-pushed) */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className={`font-semibold text-base ${darkMode ? "text-gray-400" : "text-gray-600"} hover:underline cursor-pointer transition mr-2`}
          >
            💬 Comment ({(post.comments || []).length})
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && createPortal(
          <div style={pickerStyle} className="fixed z-[99999]">
            <AnimatePresence>
              <motion.div
                ref={pickerRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${darkMode ? "bg-slate-800 border-white/10" : "bg-white border-gray-300"} border shadow-2xl rounded-full px-4 py-2 flex gap-3 ring-1 ring-black ring-opacity-5`}
              >
                {Object.keys(emojiLabels).map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.3 }}
                    whileHover={{ scale: 1.1 }}
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    onClick={() => {
                      handleReact(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`text-2xl relative ${userReacted(emoji) ? "opacity-100" : "opacity-60"
                      }`}
                  >
                    {emoji}
                    {hoveredEmoji === emoji && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap"
                      >
                        {emojiLabels[emoji]}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}
