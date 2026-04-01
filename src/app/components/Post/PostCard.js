"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Subcomponents
import PostHeader from "./Visual/PostHeader";
import PostContent from "./Visual/PostContent";
import PostMedia from "./Visual/PostMedia";
import PostReactions from "./Visual/PostReactions";
import dynamic from "next/dynamic";
const PostModal = dynamic(() => import("./Visual/PostModal"), { ssr: false });
import CommentInput from "./Visual/CommentInput";
const CommentCard = dynamic(() => import("./Visual/commentCard"), { ssr: false });
import EventRegistrationModal from "./EventRegistrationModal";
import AdminRegistrationsModal from "./AdminRegistrationsModal";
import ReactionModal from "./Visual/ReactionModal";
import FullImageViewer from "./utils/FullImageViewer";

// Hooks
import usePostSocket from "./hooks/usePostSocket";
import usePostEffects from "./hooks/usePostEffects";
import usePostActions from "./hooks/usePostActions";
import useEmojiAnimation from "./hooks/useEmojiAnimation";
import useCommentActions from "./hooks/useCommentActions";
import getEmojiFromUnified from "./utils/getEmojiFromUnified";

export default function PostCard({ post, currentUser, setPosts, initialShowComments = false, darkMode = false, hideActions = false, transparentBackground = false }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleComments, setVisibleComments] = useState(2);
  const [showModal, setShowModal] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [showThread, setShowThread] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [reactionEffect, setReactionEffect] = useState(null);
  const [showComments, setShowComments] = useState(initialShowComments);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionModalEmoji, setReactionModalEmoji] = useState(null);
  const [reactionModalUsers, setReactionModalUsers] = useState([]);

  // Event specific states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const editKey = `draft-${post._id}`;
  const likeIconRef = useRef(null);

  // 🔌 Socket typing updates
  usePostSocket(post._id, currentUser, setSomeoneTyping, setPosts);

  // 📦 Centralize all effects
  const postRef = usePostEffects({
    post,
    currentUser,
    setEditContent,
    setHasLiked,
    editing,
    textareaRef,
    setSomeoneTyping,
    setPosts,
  });

  // 🎉 Like and reaction animation
  const { triggerLikeAnimation, triggerReactionEffect } = useEmojiAnimation(likeIconRef, post, currentUser);

  // 🔧 Actions related to the post (like, react, delete, edit)
  const {
    handleReact,
    handleEditSave,
    handleDelete,
    toggleEdit,
    handleBlurSave
  } = usePostActions({
    post,
    currentUser,
    setPosts,
    setEditing,
    editContent,
    setEditContent,
    setIsLiking,
    triggerLikeAnimation,
    triggerReactionEffect,
    hasLiked,             // ✅ Add this
    setHasLiked,
  });

  // 💬 Actions related to comments
  const {
    handleComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
    handleEditReply,
    handleDeleteReply,
    handleReactToReply,
    handleReactToComment,
  } = useCommentActions({
    post,
    comment,
    setComment,
    currentUser,
    setPosts,
    token,
    setShowCommentEmoji
  });

  const openImage = (i) => {
    setStartIndex(i);
    setShowViewer(true);
  };

  /*const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };*/

  const getReactionCount = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.length : 0;
  };

  const userReacted = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.includes(currentUser._id) : false;
  };

  const handleLoadMore = () => {
    const total = (post.comments || []).length;
    setVisibleComments((prev) => Math.min(prev + 5, total));
  };

  const isMyPost = post.user?._id === currentUser._id;
  const isRestricted = !isMyPost && currentUser?.role !== 'admin';

  // ✅ Everything's clean and ready for the `return` section now.
  return (
    <div
      ref={postRef}
      className={`relative ${transparentBackground ? "" : (darkMode ? "bg-[#121213] shadow-none" : "bg-[#FAFAFA] shadow-[0_20px_60px_rgba(37,99,235,0.2)]")} ${transparentBackground ? "p-0" : "p-4"} rounded-[3rem] transition-all duration-500`}
    >
      <div className={`p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[2.6rem]`}>
        <div className={`relative rounded-[2.5rem] p-8 space-y-6 transition-all duration-500 ${isMyPost ? (darkMode ? "bg-slate-800/50" : "bg-gradient-to-tr from-blue-50/50 to-white") : (darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]")} ${darkMode ? "text-white" : "text-gray-900"}`}>
          <PostHeader {...{
            post, currentUser, editing, toggleEdit: () => {
              toggleEdit(editKey, (val) => {
                setEditContent(val);
                setEditTitle(post.title || "");
              }, editing, post.content);
            }, handleDelete, darkMode, hideActions
          }} />

          {post.type === "Event" && post.title && !editing && (
            <h2 className={`text-2xl font-black mb-2 ${darkMode ? "text-white" : "text-gray-900"} tracking-tight leading-tight`}>
              {post.title}
            </h2>
          )}

          <PostContent
            {...{
              post,
              editing,
              editContent,
              setEditContent,
              editTitle,
              setEditTitle,
              handleEditSave: () => handleEditSave({ content: editContent, title: editTitle }),
              handleBlurSave,
              showEditEmoji,
              setShowEditEmoji,
              textareaRef,
              getEmojiFromUnified,
              setShowModal,
              darkMode
            }}
          />

          {post.type === "Event" && (
            <div className={`mt-4 p-6 rounded-3xl border ${darkMode ? "bg-[#FAFAFA]/5 border-white/10" : "bg-blue-50/50 border-blue-100"} space-y-4`}>
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

          <PostMedia
            post={post}
            currentUser={currentUser}
            setSelectedImage={(index) => {
              setStartIndex(index);
              setShowViewer(true);
            }}
            darkMode={darkMode}
          />
          {/* Gradient Separator before Reactions */}
          <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-blue-500/30" : "via-blue-600/50"} to-transparent my-2`} />

          <PostReactions
            {...{
              post,
              hasLiked,
              handleReact,
              userReacted,
              getReactionCount,
              setShowModal,
              likeIconRef,
              isLiking,
              setVisibleComments,
              setReactionEffect,
              reactionEffect,
              showComments,
              setShowComments,
              setShowReactionModal,
              setReactionModalEmoji,
              setReactionModalUsers,
              darkMode
            }}
          />


          <CommentInput
            comment={comment}
            setComment={setComment}
            onEmojiClick={(emoji) => setComment((prev) => prev + emoji)}
            onSubmit={() => handleComment(comment)} // ✅ Correct
            showCommentEmoji={showCommentEmoji}
            setShowCommentEmoji={setShowCommentEmoji}
            typing={someoneTyping}
            isTyping={(val) => setSomeoneTyping(val)}
            darkMode={darkMode}
          />

          {someoneTyping && (
            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} mt-1 ml-2 italic`}>
              Someone is typing...
            </p>
          )}

          {/* Gradient Separator after Comment Input */}
          {showComments && (
            <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${darkMode ? "via-purple-500/30" : "via-purple-600/50"} to-transparent my-4`} />
          )}

          {showComments && (
            <div className="pt-2 space-y-3">
              {(post.comments || [])
                .slice()
                .reverse()
                .slice(0, visibleComments)
                .map((c) => (
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

              {(post.comments || []).length > visibleComments && (
                <button
                  onClick={handleLoadMore}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Load more comments
                </button>
              )}

              {visibleComments > 2 && (
                <button
                  onClick={() => setVisibleComments(2)}
                  className="mt-1 text-sm text-red-500 hover:underline"
                >
                  Show less comments
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {showModal && (
              <PostModal
                {...{
                  post,
                  currentUser,
                  showModal,
                  setShowModal,
                  toggleEdit,
                  handleReact,
                  userReacted,
                  getReactionCount,
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
                  handleEditSave: () => handleEditSave({ content: editContent, title: editTitle }),
                  handleBlurSave,
                  toggleEdit,
                  handleDelete,
                  showEditEmoji,
                  setShowEditEmoji,
                  textareaRef,
                  // ✅ ADD THESE for FullImageViewer support
                  setShowViewer,
                  setStartIndex,
                  darkMode,
                  setPosts,
                  handleReactToComment
                }}
              />
            )}
          </AnimatePresence>

          {showViewer && (
            <FullImageViewer
              images={post.images?.map((img) => img.url)} // ✅ extract URLs
              startIndex={startIndex}
              onClose={() => setShowViewer(false)}
              isRestricted={isRestricted}
            />
          )}

          {showReactionModal && (
            <ReactionModal
              emoji={reactionModalEmoji}
              users={reactionModalUsers}
              onClose={() => setShowReactionModal(false)}
            />
          )}

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
      </div>
    </div>
  );
}
