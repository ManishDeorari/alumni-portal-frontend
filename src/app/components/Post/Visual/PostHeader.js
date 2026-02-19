import React, { useState } from "react";
import Image from "next/image";
import ImageViewerModal from "../../profile/ImageViewerModal";
import Link from "next/link";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete, darkMode = false }) {
  const [showViewer, setShowViewer] = useState(false);
  const profileImg = post.user?.profilePicture || "/default-profile.jpg";
  const isSelf = post.user?._id === currentUser?._id;
  const isRestricted = !isSelf && currentUser?.role !== 'admin';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <Image
          src={profileImg}
          alt="User profile"
          width={48}
          height={48}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full border-2 ${darkMode ? "border-blue-500" : "border-black"} object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform ${isRestricted ? 'select-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowViewer(true);
          }}
        />
        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10 cursor-pointer rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowViewer(true);
            }}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
      <div>
        <div className={`font-semibold flex items-center gap-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
          {isSelf ? (
            <span>{post.user?.name || "Unknown"}</span>
          ) : (
            <Link
              href={`/dashboard/profile?id=${post.user?._id}`}
              className={`hover:underline ${darkMode ? "text-blue-400 decoration-blue-500" : "text-blue-700 decoration-blue-400"} decoration-2 transition-colors cursor-pointer`}
            >
              {post.user?.name || "Unknown"}
            </Link>
          )}
          {isSelf && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              You
            </span>
          )}
          {post.type && post.type !== "Regular" && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${post.type === "Session" ? "bg-green-100 text-green-600" :
              post.type === "Event" ? "bg-orange-100 text-orange-600" :
                "bg-red-100 text-red-600"
              }`}>
              {post.type}
            </span>
          )}
        </div>
        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{new Date(post.createdAt).toLocaleString()}</p>
      </div>

      {post.user?._id === currentUser._id && (
        <div className="ml-auto flex gap-2">
          <button onClick={toggleEdit} className={`${darkMode ? "text-blue-400" : "text-blue-600"} text-sm hover:underline font-bold`}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className={`${darkMode ? "text-red-400" : "text-red-600"} text-sm hover:underline font-bold`}>
            Delete
          </button>
        </div>
      )}

      {showViewer && (
        <ImageViewerModal
          imageUrl={profileImg}
          onClose={() => setShowViewer(false)}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}
