"use client";
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CommentCard from "./commentCard";
import PostMedia from "./PostMedia";
import CommentInput from "./CommentInput";
import Link from "next/link";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostReactions from "./PostReactions";
import getEmojiFromUnified from "../utils/getEmojiFromUnified";
import { useState } from "react";

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
  darkMode = false
}) {
  const [showCommentsState, setShowCommentsState] = useState(true);
  const isSelf = post.user?._id === currentUser?._id;
  const isRestricted = !isSelf && currentUser?.role !== 'admin';
  const editKey = `draft-${post._id}`;

  if (!showModal) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[2.6rem] max-w-4xl w-full max-h-[90vh] shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex flex-col`}
      >
        <div className={`${darkMode ? "bg-[#0f172a]" : "bg-white"} rounded-[2.5rem] p-8 overflow-y-auto overflow-x-visible custom-scrollbar flex-1 relative`}>
          <button
            onClick={() => {
              if (editing) setEditing(false);
              setShowModal(false);
            }}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
              darkMode={darkMode}
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
              darkMode={darkMode}
            />
          </div>

          {/* Media */}
          {!editing && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <PostMedia
                post={post}
                currentUser={currentUser}
                setSelectedImage={(index) => {
                  setStartIndex(index);
                  setShowViewer(true);
                }}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Reaction & Comment Toggle Buttons */}
          <div className="mb-6">
            <PostReactions
              post={post}
              handleReact={handleReact}
              getReactionCount={getReactionCount}
              userReacted={userReacted}
              reactionEffect={reactionEffect}
              setReactionEffect={setReactionEffect}
              showComments={showCommentsState}
              setShowComments={setShowCommentsState}
              darkMode={darkMode}
            />
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <CommentInput
              comment={comment}
              setComment={setComment}
              onSubmit={() => handleComment(comment)}
              postId={post._id}
              currentUser={currentUser}
              darkMode={darkMode}
            />
          </div>

          {/* Full Comment Thread */}
          <AnimatePresence>
            {showCommentsState && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-6 overflow-hidden"
              >
                <h3 className={`font-black uppercase tracking-widest text-[10px] ${darkMode ? "text-gray-400" : "text-gray-900"} border-b-2 border-blue-500 w-fit pb-1 mb-4`}>
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
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
