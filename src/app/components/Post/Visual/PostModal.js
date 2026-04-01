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
import EventRegistrationModal from "../EventRegistrationModal";
import AdminRegistrationsModal from "../AdminRegistrationsModal";

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
  editTitle,
  setEditTitle,
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
  darkMode = false,
  setPosts, // Add setPosts to update state after registration
  handleReactToComment // Add handleReactToComment
}) {
  const [showCommentsState, setShowCommentsState] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
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
        <div className={`${darkMode ? "bg-[#0f172a]" : "bg-[#FAFAFA]"} rounded-[2.5rem] p-8 overflow-y-auto overflow-x-visible custom-scrollbar flex-1 relative`}>
          <button
            onClick={() => {
              if (editing) setEditing(false);
              setShowModal(false);
            }}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all p-2 hover:bg-gray-100 dark:hover:bg-[#FAFAFA]/5 rounded-full z-[110]"
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
            {post.type === "Event" && post.title && !editing && (
              <h2 className={`text-2xl font-black mb-4 ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-tight`}>
                {post.title}
              </h2>
            )}
            <PostContent
              post={post}
              editing={editing}
              editContent={editContent}
              setEditContent={setEditContent}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              handleEditSave={handleEditSave}
              handleBlurSave={handleBlurSave}
              showEditEmoji={showEditEmoji}
              setShowEditEmoji={setShowEditEmoji}
              textareaRef={textareaRef}
              getEmojiFromUnified={getEmojiFromUnified}
              setShowModal={setShowModal}
              darkMode={darkMode}
              hideViewFullPost={true}
            />

            {post.type === "Event" && (
              <div className={`mt-6 p-6 rounded-3xl border ${darkMode ? "bg-[#FAFAFA]/5 border-white/10" : "bg-blue-50/50 border-blue-100"} space-y-4`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Start</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-blue-300" : "text-blue-700"}`}>{new Date(post.startDate).toLocaleDateString()} at {post.startTime}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Ends</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-purple-300" : "text-purple-700"}`}>{new Date(post.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2 flex flex-col pt-2 border-t border-dashed border-gray-200 dark:border-white/10">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Registration Deadline</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>{new Date(post.registrationCloseDate).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 items-center">
                  {(currentUser?.isAdmin || currentUser?.role === 'faculty' || post.user?._id === currentUser?._id) ? (
                    <>
                      <button
                        onClick={() => setShowAdminModal(true)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95"
                      >
                        View Registrations
                      </button>
                      {post.showRegistrationInsights && (
                        <span className={`text-xs font-bold self-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Registered: {post.registrationCount || 0}
                        </span>
                      )}
                    </>
                  ) : (
                    currentUser?.role === 'alumni' && (
                      Date.now() < new Date(post.registrationCloseDate) ? (
                        <button
                          onClick={() => setShowRegistrationModal(true)}
                          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${post.isRegistered ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105"}`}
                        >
                          {post.isRegistered ? "Edit Registration" : "Register Now"}
                        </button>
                      ) : (
                        <span className="text-sm font-bold text-red-500 italic">Registration Closed</span>
                      )
                    )
                  )}
                </div>
              </div>
            )}
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
                      onReactToComment={handleReactToComment}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showRegistrationModal && (
            <EventRegistrationModal
              event={post}
              isOpen={showRegistrationModal}
              onClose={() => setShowRegistrationModal(false)}
              currentUser={currentUser}
              darkMode={darkMode}
              onRegisterSuccess={(newRegistration) => {
                if (setPosts) {
                  setPosts(prev => prev.map(p =>
                    p._id === post._id
                      ? { ...p, isRegistered: true, myRegistration: newRegistration, registrationCount: (p.registrationCount || 0) + (newRegistration.isGroup ? newRegistration.groupMembers.length + 1 : 1) }
                      : p
                  ));
                }
              }}
            />
          )}

          {showAdminModal && (
            <AdminRegistrationsModal
              event={post}
              isOpen={showAdminModal}
              onClose={() => setShowAdminModal(false)}
              darkMode={darkMode}
            />
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
