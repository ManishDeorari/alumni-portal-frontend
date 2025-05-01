"use client";

import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

export default function PostCard({ post, currentUser }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setLiked(!liked);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");

    const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: commentText }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments([...comments, newComment]);
      setCommentText("");
    }
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-2">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.author?.profileImage || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
          alt="User"
        />
        <div>
          <p className="font-semibold">{post.author?.name}</p>
          <p className="text-xs text-gray-500">{post.author?.email}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-2">
        <button onClick={handleLike} className="flex items-center gap-1 text-red-500">
          {liked ? <FaHeart /> : <FaRegHeart />} {likes}
        </button>
        <span className="flex items-center gap-1 text-blue-600">
          <FaComment /> {comments.length}
        </span>
      </div>

      {/* Comments */}
      <div className="mt-3 space-y-2">
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-100 rounded p-2 text-sm">
            <strong>{c.user?.name || "Anonymous"}:</strong> {c.text}
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-grow px-3 py-2 border rounded focus:outline-none text-black"
        />
        <button onClick={handleComment} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Comment
        </button>
      </div>
    </div>
  );
}
