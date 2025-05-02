"use client";

import React, { useState } from "react";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";

export default function PostCard({ post, user }) {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const hasLiked = likes.includes(user?._id);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedPost = await res.json();
      setLikes(updatedPost.likes);
    } catch (err) {
      console.error("❌ Error liking post:", err.message);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        }
      );
      const updatedPost = await res.json();
      setComments(updatedPost.comments);
      setNewComment("");
    } catch (err) {
      console.error("❌ Error adding comment:", err.message);
    }
  };

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-md p-4 space-y-2">
      {/* Header: Profile Image + Name */}
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePic || "/default-profile.png"}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold">{post.user?.name || "Unknown User"}</h2>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-lg">{post.content}</p>

      {/* Like & Comment Buttons */}
      <div className="flex items-center gap-4 text-sm mt-2">
        <button onClick={handleLike} className="flex items-center gap-1">
          {hasLiked ? (
            <FaHeart className="text-red-600" />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
          <span>{likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1"
        >
          <FaRegComment />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 border-t pt-3 space-y-3">
          {comments.map((c, i) => (
            <div key={i}>
              <p className="text-sm font-semibold">{c.name || "Anonymous"}</p>
              <p className="text-sm text-gray-700">{c.text}</p>
            </div>
          ))}

          {/* Add Comment */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow px-3 py-2 border rounded focus:outline-none"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
