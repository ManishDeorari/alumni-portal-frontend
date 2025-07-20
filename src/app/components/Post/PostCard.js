"use client";
import React, { useState, useEffect, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Subcomponents
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMedia from "./PostMedia";
import PostReactions from "./PostReactions";
import PostModal from "./PostModal";
import CommentInput from "./CommentInput";
import CommentCard from "./commentCard";
import FullImageViewer from "./FullImageViewer";

// Hooks
import usePostSocket from "./usePostSocket";
import usePostEffects from "./hooks/usePostEffects";
import usePostActions from "./hooks/usePostActions";
//import useEmojiAnimation from "./hooks/useEmojiAnimation";
import useCommentActions from "./hooks/useCommentActions";
import getEmojiFromUnified from "./utils/getEmojiFromUnified";

// Socket
import socket from "../../../utils/socket";

export default function PostCard({ post, currentUser, setPosts }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
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

  const textareaRef = useRef(null);
  const token = localStorage.getItem("token");
  const editKey = `draft-${post._id}`;
  const likeIconRef = useRef(null);

  // 🔌 Socket typing updates
  usePostSocket(post._id, currentUser, setSomeoneTyping, setPosts);

  // 📦 Centralize all effects
  usePostEffects({ post, currentUser, setHasLiked, editing, textareaRef, editKey, setEditContent });

  // 🎉 Like and reaction animation
  const { triggerLikeAnimation, triggerReactionEffect } = useEmojiAnimation(likeIconRef, post, currentUser);

  // 🔧 Actions related to the post (like, react, delete, edit)
  const {
    handleLike,
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
    likeIconRef,
    token,
    isLiking,
    setIsLiking,
    triggerLikeAnimation,
    triggerReactionEffect
  });

  // 💬 Actions related to comments
  const {
    handleComment,
    handleReply,
    handleDeleteComment,
    handleEditComment
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

  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const getReactionCount = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.length : 0;
  };

  const userReacted = (emoji) => {
    const users = post.reactions?.[emoji];
    return Array.isArray(users) ? users.includes(currentUser._id) : false;
  };

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 3);
  };

  // ✅ Everything's clean and ready for the `return` section now.
  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-3 relative">
      <PostHeader {...{ post, currentUser, editing, toggleEdit, handleDelete }} />

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
          handleLike,
          handleReact,
          userReacted,
          getReactionCount,
          setShowModal,
          likeIconRef,
          isLiking,           // ✅ Add this
          setVisibleComments,
          setReactionEffect,
          reactionEffect,
        }}
      />

      <div className="pt-2 border-t border-gray-200 space-y-2">
        {(post.comments || []).slice(0, visibleComments).map((c) => (
          <CommentCard
            key={c._id}
            comment={c}
            currentUser={currentUser}
            onReply={handleReply}
            onDelete={handleDeleteComment}
            onEdit={handleEditComment}
            replies={c.replies || []}
          />
        ))}
        {(post.comments || []).length > visibleComments && (
          <button onClick={handleLoadMore} className="mt-2 text-sm text-blue-600">
            Load more comments
          </button>
        )}
      </div>

      <CommentInput
        {...{
          post,
          currentUser,
          comment,
          setComment,
          handleComment,
          showCommentEmoji,
          setShowCommentEmoji,
          data,
          getEmojiFromUnified,
          socket,
          someoneTyping,
        }}
      />

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
          images={post.images}
          startIndex={startIndex}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}
