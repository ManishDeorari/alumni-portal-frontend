"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import socket from "@/utils/socket";

export default function Sidebar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shakeNotification, setShakeNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    setIsAdmin(user.role === "admin" || user.isAdmin);

    const token = localStorage.getItem("token");

    // Fetch initial unread notifications count
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const unread = data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    // Fetch pending connection requests count
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/connect/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingRequestsCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      }
    };

    // Fetch new posts indicator (simple check for now)
    const fetchNewPosts = async () => {
      try {
        const lastSeenTimestamp = localStorage.getItem("lastSeenPosts") || new Date(0).toISOString();
        const res = await fetch(`${API_URL}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const newPosts = data.filter(p => new Date(p.createdAt) > new Date(lastSeenTimestamp));
          setNewPostsCount(newPosts.length > 0 ? 1 : 0);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchNotifications();
    fetchPendingRequests();
    fetchNewPosts();

    socket.emit("join", user._id);

    const handleNewNotification = (notification) => {
      console.log("🔔 Sidebar received notification:", notification);
      setUnreadCount(prev => prev + 1);

      // Trigger shake animation
      setShakeNotification(true);
      setTimeout(() => setShakeNotification(false), 1000);

      // If it's a connection request, update pending count
      if (notification.type === "connect_request") {
        setPendingRequestsCount(prev => prev + 1);
      }
    };

    const handleNewPost = () => {
      setNewPostsCount(1);
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("newPost", handleNewPost);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("newPost", handleNewPost);
    };
  }, []);

  // Clear new posts indicator when visiting home
  const handleHomeClick = () => {
    localStorage.setItem("lastSeenPosts", new Date().toISOString());
    setNewPostsCount(0);
  };

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">

      {/* Logo or App Name */}
      <div className="text-2xl font-bold">
        Alumni Portal
      </div>

      {/* Navigation Links - Icon Only */}
      <div className="flex space-x-8 items-center text-2xl">
        {/* Home */}
        <Link
          href="/dashboard"
          className="hover:text-gray-200 relative group"
          onClick={handleHomeClick}
          title="Home"
        >
          <FaHome />
          {newPostsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Network */}
        <Link
          href="/dashboard/network"
          className="hover:text-gray-200 relative group"
          title="Network"
        >
          <FaUserFriends />
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Messages */}
        <Link
          href="/dashboard/messages"
          className="hover:text-gray-200 relative group"
          title="Messages"
        >
          <FaEnvelope />
        </Link>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="hover:text-gray-200 relative group"
          title="Notifications"
        >
          <FaBell className={`${unreadCount > 0 ? "text-yellow-300" : ""} ${shakeNotification ? "animate-shake" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </Link>

        {/* Profile */}
        <Link
          href="/dashboard/profile"
          className="hover:text-gray-200 relative group"
          title="Profile"
        >
          <FaUserCircle />
        </Link>

        {/* Admin (Only for admins) */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className="hover:text-gray-200 relative group"
            title="Admin Panel"
          >
            <FaUserShield />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </Link>
        )}

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hover:text-gray-200 relative group pt-1"
            title="Settings"
          >
            <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
          </button>

          {showSettings && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSettings(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setShowResetModal(true);
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/10 transition-colors border-b border-white/10"
                >
                  <FaKey className="text-blue-400" />
                  <span>Reset Password</span>
                </button>
                <button
                  onClick={handleSignout}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Signout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />

    </nav>
  );
}
