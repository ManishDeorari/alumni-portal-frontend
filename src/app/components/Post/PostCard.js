"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Subcomponents
import PostHeader from "../Post/Visual/PostHeader";
import PostContent from "../Post/Visual/PostContent";
import PostMedia from "../Post/Visual/PostMedia";
import PostReactions from "../Post/Visual/PostReactions";
import PostModal from "../Post/Visual/PostModal";
import CommentInput from "../Post/Visual/CommentInput";
import CommentCard from "../Post/Visual/commentCard";
import ReactionModal from "./Visual/ReactionModal";
import FullImageViewer from "./utils/FullImageViewer";

// Hooks
import usePostSocket from "./hooks/usePostSocket";
import usePostEffects from "./hooks/usePostEffects";
import usePostActions from "./hooks/usePostActions";
import useEmojiAnimation from "./hooks/useEmojiAnimation";
import useCommentActions from "./hooks/useCommentActions";
import getEmojiFromUnified from "./utils/getEmojiFromUnified";

export default function PostCard({ post, currentUser, setPosts }) {
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
  const [showComments, setShowComments] = useState(false);
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
  const { triggerLikeAnimation , triggerReactionEffect } = useEmojiAnimation(likeIconRef, post, currentUser);

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
  // ✅ Everything's clean and ready for the `return` section now.
  return (
      <div
        ref={postRef}
        className={`relative rounded-lg border border-black p-4 space-y-3 shadow transition-all duration-300
          ${isMyPost ? "bg-gradient-to-tr from-gray-175 to-blue-50" : "bg-white"}
          hover:shadow-md`}
      >

      <PostHeader {...{ post, currentUser, editing, toggleEdit: () =>
      toggleEdit(editKey, setEditContent, editing, post.content), handleDelete }} />

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
        }}
      />

      <PostMedia
          post={post}
          setSelectedImage={(index) => {
            setStartIndex(index);
            setShowViewer(true);
          }}
        />

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
  }}
/>


      {showComments && (
        <div className="pt-2 border-t border-gray-200 space-y-2">
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

    <CommentInput
      comment={comment}
      setComment={setComment}
      onEmojiClick={(emoji) => setComment((prev) => prev + emoji)}
      onSubmit={() => handleComment(comment)} // ✅ Correct
      showCommentEmoji={showCommentEmoji}
      setShowCommentEmoji={setShowCommentEmoji}
      typing={someoneTyping}
      isTyping={(val) => setSomeoneTyping(val)}
    />

    {someoneTyping && (
      <p className="text-xs text-gray-400 mt-1 ml-2 italic">
        Someone is typing...
      </p>
    )}

      <hr className="my-6 border-black" />

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
              // ✅ ADD THESE for FullImageViewer support
              setShowViewer,
              setStartIndex,
            }}
          />
        )}
      </AnimatePresence>

      {showViewer && (
        <FullImageViewer
          images={post.images?.map((img) => img.url)} // ✅ extract URLs
          startIndex={startIndex}
          onClose={() => setShowViewer(false)}
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
  );
}
