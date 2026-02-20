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
      className={`relative ${transparentBackground ? "" : (darkMode ? "bg-slate-900 shadow-none" : "bg-white shadow-[0_20px_60px_rgba(37,99,235,0.2)]")} ${transparentBackground ? "p-0" : "p-4"} rounded-[3rem] transition-all duration-500`}
    >
      <div className={`p-[2.5px] ${darkMode ? "bg-gradient-to-tr from-blue-900 to-purple-900" : "bg-gradient-to-tr from-blue-600 to-purple-700"} rounded-[2.6rem]`}>
        <div className={`relative rounded-[2.5rem] p-8 space-y-6 transition-all duration-500 ${isMyPost ? (darkMode ? "bg-slate-800/50" : "bg-gradient-to-tr from-blue-50/50 to-white") : (darkMode ? "bg-slate-900" : "bg-white")} ${darkMode ? "text-white" : "text-gray-900"}`}>
          <PostHeader {...{
            post, currentUser, editing, toggleEdit: () =>
              toggleEdit(editKey, setEditContent, editing, post.content), handleDelete, darkMode, hideActions
          }} />

          <PostContent
            {...{
              post,
              editing,
              editContent,
              setEditContent,
              handleEditSave,
              handleBlurSave,
              showEditEmoji,
              setShowEditEmoji,
              textareaRef,
              getEmojiFromUnified,
              setShowModal,
              darkMode
            }}
          />

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
                  handleEditSave,
                  handleBlurSave,
                  toggleEdit,
                  handleDelete,
                  showEditEmoji,
                  setShowEditEmoji,
                  textareaRef,
                  // ✅ ADD THESE for FullImageViewer support
                  setShowViewer,
                  setStartIndex,
                  darkMode
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
        </div>
      </div>
    </div>
  );
}
