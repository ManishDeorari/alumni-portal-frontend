import React, { useState } from "react";
import ImageViewerModal from "../../profile/ImageViewerModal";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete }) {
  const [showViewer, setShowViewer] = useState(false);
  const profileImg = post.user?.profilePicture || "/default-profile.jpg";

  return (
    <div className="flex items-center gap-3">
      <img
        src={profileImg}
        alt="User profile"
        width={112}
        height={112}
        className="rounded-full border-1 border-white object-cover w-12 h-12"
        onClick={() => setShowViewer(true)}
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
