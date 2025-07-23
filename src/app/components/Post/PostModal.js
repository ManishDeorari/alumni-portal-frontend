"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommentCard from "./commentCard";
import PostMedia from "./PostMedia"; // ✅ Make sure this import is present
import PostReactions from "./PostReactions"; // ensure this import exists

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


            {/* Emoji Reaction Buttons */} 
            <PostReactions
              post={post}
              hasLiked={post.likes?.includes(currentUser._id)}
              handleLike={() => {}} // optional placeholder, or pass real handler
              handleReact={handleReact}
              userReacted={userReacted}
              getReactionCount={getReactionCount}
              setShowModal={setShowModal}
              likeIconRef={null}
              isLiking={false}
              setVisibleComments={() => {}}
              setReactionEffect={setReactionEffect}
              reactionEffect={reactionEffect}
            />

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
