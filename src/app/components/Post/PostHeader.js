"use client";
import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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
        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={toggleEdit}
            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
          >
            <PencilIcon className="w-4 h-4" />
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 text-sm hover:underline flex items-center gap-1"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
