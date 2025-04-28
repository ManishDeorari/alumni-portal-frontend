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
