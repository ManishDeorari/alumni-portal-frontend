"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommentCard from "../Visual/commentCard";
import PostMedia from "../Visual/PostMedia"; // ✅ Make sure this import is present

export default function PostModal({
  showModal,
  setShowModal,
  post,
  currentUser,
  handleReact,
  getReactionCount,
  userReacted,
  reactionEffect,
  setReactionEffect,
  showThread,
  setShowThread,
  handleReply,
  handleDeleteComment,
  // ✅ Add these two
  setShowViewer,
  setStartIndex,
  handleLike,
  hasLiked,
  isLiking,
  likeIconRef,
}) {
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.user?.profilePic || "/default-profile.png"}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{post.user?.name || "Unknown"}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="whitespace-pre-wrap mb-4">{post.content}</p>

            {/* Media */}
            <PostMedia
              post={post}
              setSelectedImage={(index) => {
                setStartIndex(index);
                setShowViewer(true);
              }}
            />

            {/* Reaction Stats */}
            <div className="text-sm text-gray-600 flex gap-6 mb-3">
              <span>💬 {post.comments?.length || 0} Comments</span>
            </div>

            {/* Emoji Reaction Buttons */}
            <div className="flex gap-3 mb-4">
              {["👍","❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
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

            {/* Full Comment Thread */}
            <div className="space-y-3 border-t pt-3">
              {showThread ? (
                (post.comments || []).map((c) => (
                  <CommentCard
                    key={c._id}
                    comment={c}
                    currentUser={currentUser}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                    replies={c.replies || []}
                    showReplyCount
                  />
                ))
              ) : (
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setShowThread(true)}
                >
                  View full thread ({post.comments?.length || 0} comments)
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
