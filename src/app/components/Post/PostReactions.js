"use client";
import React from "react";
import { motion } from "framer-motion";

export default function PostReactions({
  post,
  hasLiked,
  handleLike,
  handleReact,
  getReactionCount,
  userReacted,
  setReactionEffect,
  reactionEffect,
  setVisibleComments,
  likeIconRef,
  isLiking, // ✅ Add this here
}) {
  return (
    <>
      {/* Reactions Summary */}
      {post.reactions && Object.keys(post.reactions || {}).length > 0 && (
        <div className="flex gap-3 mt-1 flex-wrap">
          {Object.entries(post.reactions || {}).map(([emoji, users]) => {
            if (!Array.isArray(users) || users.length === 0) return null;
            return (
              <div
                key={emoji}
                className={`text-lg px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1 ${
                  userReacted(emoji) ? "border border-blue-500 bg-blue-50" : ""
                }`}
              >
                {emoji}
                <span className="text-sm text-gray-600">x{users.length}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Like and Comment Buttons */}
      <div className="flex items-center gap-5 pt-2 border-t border-gray-300">
        <button
          ref={likeIconRef}
          id={`like-icon-${post._id}`}
          onClick={handleLike}
          disabled={isLiking}
          className={`font-semibold transition-colors duration-300  ${
            hasLiked ? "text-blue-600" : "text-gray-600"
          } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          👍 Like ({(post.likes || []).length})
        </button>

        <button
          onClick={() => setVisibleComments((prev) => prev + 5)}
          className="font-semibold text-gray-600"
        >
          💬 Comment ({(post.comments || []).length})
        </button>
      </div>

      {/* Emoji Reaction Buttons */}
      <div className="flex gap-3 mt-2">
        {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
          <motion.div
            key={emoji}
            className="relative flex items-center"
            onMouseEnter={() => setReactionEffect(emoji)}
            onMouseLeave={() => setReactionEffect(null)}
          >
            <motion.button
              whileTap={{ scale: 1.3 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleReact(emoji)}
              className={`text-2xl ${userReacted(emoji) ? "opacity-100" : "opacity-60"}`}
              title={userReacted(emoji) ? "You reacted" : `${getReactionCount(emoji)} reacted`}
            >
              {emoji} {getReactionCount(emoji) > 0 ? getReactionCount(emoji) : ""}
            </motion.button>
            {reactionEffect === emoji && (
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm px-2 py-1 bg-gray-800 text-white rounded shadow">
                {emoji}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}
