"use client";
import React from "react";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={post.user?.profilePicture || defaultImage} 
        alt="User profile"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-semibold flex items-center gap-1">
          {post.user?.name || "Unknown"}
          {post.user?._id === currentUser._id && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              You
            </span>
          )}
        </p>
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
