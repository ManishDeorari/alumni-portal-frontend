"use client";
import React, { useState } from "react";

export default function PostCard({ post, currentUser, setPosts }) {
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("token");

  const handleLike = async () => {
    const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: comment }),
    });
    const updated = await res.json();
    setComment("");
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  const hasLiked = post.likes.includes(currentUser._id);

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePic || "/default-profile.png"}
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{post.user?.name || "Unknown"}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <p className="text-gray-800">{post.content}</p>

      <div className="flex gap-4 text-sm items-center">
        <button
          onClick={handleLike}
          className={`font-semibold ${hasLiked ? "text-blue-600" : "text-gray-600"}`}
        >
          👍 {post.likes.length} {hasLiked ? "Liked" : "Like"}
        </button>
        <span className="text-gray-500">💬 {post.comments.length} Comments</span>
      </div>

      <div className="space-y-2">
        {post.comments.map((c, i) => (
          <div key={i} className="border-t pt-2 text-sm">
            <strong>{c.user?.name || "User"}:</strong> {c.text}
          </div>
        ))}
      </div>

      <div className="flex mt-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-grow border p-2 rounded-l"
        />
        <button
          onClick={handleComment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r"
        >
          Comment
        </button>
      </div>
    </div>
  );
}
