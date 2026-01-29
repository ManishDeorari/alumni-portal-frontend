"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommentCard from "./commentCard";
import PostMedia from "./PostMedia";
import CommentInput from "./CommentInput";
import Link from "next/link";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import getEmojiFromUnified from "../utils/getEmojiFromUnified";

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
  handleComment,
  handleEditComment,
  handleEditReply,
  handleDeleteReply,
  handleReactToReply,
  comment,
  setComment,
  editing,
  setEditing,
  editContent,
  setEditContent,
  handleEditSave,
  handleBlurSave,
  toggleEdit,
  handleDelete,
  showEditEmoji,
  setShowEditEmoji,
  textareaRef,
  // ✅ Add these two
  setShowViewer,
  setStartIndex,
  handleLike,
  hasLiked,
  isLiking,
  likeIconRef,
}) {
  const isSelf = post.user?._id === currentUser?._id;
  const editKey = `draft-${post._id}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto overflow-x-visible shadow-2xl custom-scrollbar"
      >
        <button
          onClick={() => {
            if (editing) setEditing(false);
            setShowModal(false);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-100 rounded-full z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-12">
          <PostHeader
            post={post}
            currentUser={currentUser}
            editing={editing}
            toggleEdit={() => toggleEdit(editKey, setEditContent, editing, post.content)}
            handleDelete={() => {
              handleDelete();
              setShowModal(false);
            }}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <PostContent
            post={post}
            editing={editing}
            editContent={editContent}
            setEditContent={setEditContent}
            handleEditSave={handleEditSave}
            handleBlurSave={handleBlurSave}
            showEditEmoji={showEditEmoji}
            setShowEditEmoji={setShowEditEmoji}
            textareaRef={textareaRef}
            getEmojiFromUnified={getEmojiFromUnified}
            setShowModal={setShowModal}
          />
        </div>

        {/* Media */}
        {!editing && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
            <PostMedia
              post={post}
              setSelectedImage={(index) => {
                setStartIndex(index);
                setShowViewer(true);
              }}
            />
          </div>
        )}

        {/* Emoji Reaction Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {["👍", "❤️", "😂", "😮", "😢", "😊", "👏", "🎉"].map((emoji) => {
            const reacted = userReacted(emoji);
            const count = getReactionCount(emoji);
            return (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all 
                  ${reacted
                    ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
              >
                <span className="text-xl">{emoji}</span>
                {count > 0 && <span className="text-sm font-bold">{count}</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Comment Input */}
        <div className="mb-6">
          <CommentInput
            comment={comment}
            setComment={setComment}
            onSubmit={() => handleComment(comment)}
            postId={post._id}
            currentUser={currentUser}
          />
        </div>

        {/* Full Comment Thread */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h3 className="font-bold text-gray-900 border-b-2 border-blue-500 w-fit pb-1 mb-4">
            Comments ({post.comments?.length || 0})
          </h3>

          <div className="space-y-4">
            {(post.comments || []).slice().reverse().map((c) => (
              <CommentCard
                key={c._id}
                comment={c}
                currentUser={currentUser}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                replies={c.replies || []}
                postId={post._id}
                onEditReply={handleEditReply}
                onDeleteReply={handleDeleteReply}
                onReactToReply={handleReactToReply}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
