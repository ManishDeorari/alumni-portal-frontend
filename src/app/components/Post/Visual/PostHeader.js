import React, { useState } from "react";
import ImageViewerModal from "../../profile/ImageViewerModal";
import Link from "next/link";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete }) {
  const [showViewer, setShowViewer] = useState(false);
  const profileImg = post.user?.profilePicture || "/default-profile.jpg";
  const isSelf = post.user?._id === currentUser?._id;

  return (
    <div className="flex items-center gap-3">
      <img
        src={profileImg}
        alt="User profile"
        width={112}
        height={112}
        className="rounded-full border-2 border-black object-cover w-12 h-12 cursor-pointer shadow-sm hover:scale-105 transition-transform"
        onClick={() => setShowViewer(true)}
      />
      <div>
        <div className="font-semibold flex items-center gap-1">
          {isSelf ? (
            <span className="text-gray-900">{post.user?.name || "Unknown"}</span>
          ) : (
            <Link
              href={`/dashboard/profile/${post.user?._id}`}
              className="hover:underline text-blue-700 decoration-blue-400 decoration-2 transition-colors cursor-pointer"
            >
              {post.user?.name || "Unknown"}
            </Link>
          )}
          {isSelf && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              You
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
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

      {showViewer && (
        <ImageViewerModal imageUrl={profileImg} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}
