"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useRouter } from "next/navigation";
import PostCard from "../../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleNotificationClick = async (note) => {
    if (!note.isRead) markAsRead(note._id);

    if (note.type === "connect_request" || note.type === "connect_accept") {
      router.push(`/dashboard/profile?id=${note.sender._id}`);
    } else if (note.postId) {
      // Fetch post details and open modal
      try {
        const res = await fetch(`${API_URL}/api/posts/${note.postId._id || note.postId}`);
        const postData = await res.json();
        setSelectedPost(postData);
        setShowPostModal(true);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white pb-10">
      <Sidebar />

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center italic">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((note) => (
              <div
                key={note._id}
                onClick={() => handleNotificationClick(note)}
                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border border-transparent ${note.isRead
                  ? "bg-white/5 opacity-80 hover:bg-white/10"
                  : "bg-white/20 shadow-lg border-white/20 hover:bg-white/25"
                  }`}
              >
                <img
                  src={note.sender?.profilePicture || "/default-profile.jpg"}
                  alt={note.sender?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                />
                <div className="flex-1">
                  <p className="font-medium text-lg leading-snug">
                    <span className="font-bold">{note.sender?.name}</span> {note.message}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                {!note.isRead && (
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 shadow-sm shadow-yellow-400/50"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPostModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4">
              <PostCard
                post={selectedPost}
                currentUser={user}
                setPosts={(updater) => {
                  if (typeof updater === 'function') {
                    setSelectedPost(prev => updater([prev])[0]);
                  } else {
                    setSelectedPost(updater[0] || updater);
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

