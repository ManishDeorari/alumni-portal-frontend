"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImageUrl } from "../../../utils/cloudinaryHelper";
import Image from "next/image";
import ImageViewerModal from "../../profile/ImageViewerModal";
import Link from "next/link";

export default function PostHeader({ post, currentUser, editing, toggleEdit, handleDelete, darkMode = false, hideActions = false }) {
  const [showViewer, setShowViewer] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    if (showOptions) {
      const handleClickOutside = (e) => {
        if (optionsRef.current && !optionsRef.current.contains(e.target)) {
          setShowOptions(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showOptions]);

  const profileImg = post.user?.profilePicture || "/default-profile.jpg";
  const isOwn = currentUser && (currentUser._id === post.userId?._id || currentUser.id === post.userId?._id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin || currentUser?.email === "manishdeorari377@gmail.com";
  const isRestricted = !isOwn && !isAdmin;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 sm:w-12 sm:h-12">
        <Image
          src={getOptimizedImageUrl(profileImg)}
          alt="User profile"
          width={48}
          height={48}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full border-2 ${darkMode ? "border-blue-500" : "border-black"} object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform ${isRestricted ? 'select-none pointer-events-none' : ''}`}
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
      <div className="flex-1 min-w-0">
        <div className={`font-semibold flex items-center gap-1 flex-wrap ${darkMode ? "text-white" : "text-gray-900"}`}>
          {isOwn ? (
            <span className="truncate max-w-[150px]">{post.user?.name || "Unknown"}</span>
          ) : (
            <Link
              href={`/profile/${post.user?.publicId || post.user?._id}`}
              className={`hover:underline truncate max-w-[150px] ${darkMode ? "text-blue-400 decoration-blue-500" : "text-blue-700 decoration-blue-400"} decoration-2 transition-colors cursor-pointer`}
            >
              {post.user?.name || "Unknown"}
            </Link>
          )}
          {isOwn && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${darkMode ? "bg-blue-600/30 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-600"}`}>
              You
            </span>
          )}
          {post.type && post.type !== "Regular" && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 border ${post.type === "Session" ? (darkMode ? "bg-green-600/30 text-green-300 border-green-500/30" : "bg-green-100 text-green-600 border-transparent") :
              post.type === "Event" ? (darkMode ? "bg-orange-600/30 text-orange-300 border-orange-500/30" : "bg-orange-100 text-orange-600 border-transparent") :
                (darkMode ? "bg-red-600/30 text-red-300 border-red-500/30" : "bg-red-100 text-red-600 border-transparent")
              }`}>
              {post.type}
            </span>
          )}
        </div>
        <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"} truncate`}>{new Date(post.createdAt).toLocaleString()}</p>
      </div>

      {!hideActions && (
        <div className="ml-auto flex items-center gap-2">
          {(((post.user?._id || post.user) === (currentUser?._id || currentUser)) || currentUser?.role === 'admin' || currentUser?.isAdmin || currentUser?.isMainAdmin) && (
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`p-2 rounded-full transition-colors flex items-center justify-center opacity-100 ${darkMode ? "text-gray-100 bg-white/10 hover:bg-white/20" : "text-gray-800 bg-gray-200/80 hover:bg-gray-300"}`}
              >
                <FaEllipsisH className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-50 p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
                  >
                    <div className={`w-40 rounded-[10px] backdrop-blur-md p-1 flex flex-col h-full ${darkMode ? "bg-slate-900/95 text-white" : "bg-white/95 text-gray-800"}`}>
                    {editing ? (
                      <button
                        onClick={() => {
                          toggleEdit();
                          setShowOptions(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${darkMode ? "text-blue-400 hover:bg-white/5" : "text-blue-600 hover:bg-gray-50"}`}
                      >
                        Cancel Edit
                      </button>
                    ) : (
                      <>
                        {((post.user?._id || post.user) === (currentUser?._id || currentUser)) && (
                          <button
                            onClick={() => {
                              toggleEdit();
                              setShowOptions(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${darkMode ? "text-green-400 hover:bg-white/5" : "text-green-600 hover:bg-gray-50"}`}
                          >
                            Edit Post
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowOptions(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${darkMode ? "text-red-400 hover:bg-white/5" : "text-red-600 hover:bg-gray-50"}`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    </div>
              </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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

