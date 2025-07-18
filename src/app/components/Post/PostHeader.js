"use client";
import React from "react";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={post.user?.profilePic || "/default-profile.png"}
        alt="profile"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-semibold">{post.user?.name || "Unknown"}</p>
        <p className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>
      {post.user?._id === currentUser._id && (
        <div className="ml-auto flex gap-2">
          <button onClick={toggleEdit} className="text-blue-600 text-sm hover:underline">
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="text-red-600 text-sm hover:underline">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
