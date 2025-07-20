"use client";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete }) {
  const isOwner = post.user?._id === currentUser._id;

  return (
    <div className="flex items-start justify-between">
      {/* Left: Profile Info */}
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePic || "/default-profile.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">
            {post.user?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      {isOwner && (
        <div className="flex gap-2 text-sm ml-auto">
          <button
            onClick={toggleEdit}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <Pencil size={14} />
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:underline flex items-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
