"use client";

import React from "react";
import { FaUserCircle } from "react-icons/fa";

export default function PostCard({ post }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-2">
      <div className="flex items-center gap-2">
        <FaUserCircle className="text-2xl text-gray-500" />
        <div>
          <p className="font-semibold">{post?.user?.name || "Anonymous"}</p>
          <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <p className="text-gray-700">{post.content}</p>
    </div>
  );
}
"use client";

import React, { useState } from "react";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    // TODO: Later send request to backend
  };

  return (
    <div className="bg-white text-gray-800 rounded-lg p-4 shadow space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {post.author?.charAt(0) || "U"}
        </div>
        <h2 className="font-semibold">{post.author || "Unknown User"}</h2>
      </div>
      <p className="text-sm">{post.content}</p>

      <div className="flex gap-4 pt-2">
        <button
          onClick={handleLike}
          className={`text-sm ${liked ? "text-blue-600 font-bold" : "text-gray-600"}`}
        >
          👍 {likes} Like
        </button>

        <button
          className="text-sm text-gray-600"
          // TODO: Handle comment popup later
        >
          💬 Comment
        </button>
      </div>
    </div>
  );
}
