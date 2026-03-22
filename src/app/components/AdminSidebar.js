"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey, FaUsers } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import SettingsDrawer from "./SettingsDrawer";
import NotificationPreview from "./NotificationPreview";
import socket from "@/utils/socket";
import { AnimatePresence } from "framer-motion";

export default function AdminSidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [adminSignupRequestsCount, setAdminSignupRequestsCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadGroupMessagesCount, setUnreadGroupMessagesCount] = useState(0);
  const [showNotifPreview, setShowNotifPreview] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  const fetchNotifications = React.useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(n => ({
          ...n,
          isRead: n.isRead === true || n.isRead === "true" || n.isRead === 1 || n.isRead === "1"
        }));
        setNotifications(normalized);
        setUnreadCount(normalized.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL]);

  const fetchCounts = React.useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/counts/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNewPostsCount(data.unreadPostsCount || 0);
        setPendingRequestsCount(data.pendingRequestsCount || 0);
        setUnreadGroupMessagesCount(data.unreadGroupMessagesCount || 0);
        setUnreadCount(data.unreadNotificationsCount || 0);
        setAdminSignupRequestsCount(data.adminSignupRequestsCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  }, [API_URL]);

  const markSectionAsSeen = async (section) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/counts/mark-seen/${section}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (section === "home") setNewPostsCount(0);
      if (section === "network") setPendingRequestsCount(0);
      if (section === "groups") setUnreadGroupMessagesCount(0);
    } catch (err) {
      console.error(`Failed to mark ${section} as seen:`, err);
    }
  };

  const fetchUser = React.useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
    return null;
  }, [API_URL]);

  React.useEffect(() => {
    const initialize = async () => {
      let user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!user) {
        user = await fetchUser(token);
      }
      
      if (user) {
        fetchNotifications(token);
        fetchCounts(token);
        socket.emit("join", user._id);
      }
    };

    initialize();

    const handleNewNotification = (notification) => {
      const newNotif = { ...notification, isRead: false };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (notification.type === "connect_request") {
        setPendingRequestsCount(prev => prev + 1);
      }
    };

    const handleNewSignupRequest = () => setAdminSignupRequestsCount(prev => prev + 1);
    const handleNewPost = () => setNewPostsCount(prev => prev + 1);
    const handleNewGroupMessage = () => setUnreadGroupMessagesCount(prev => prev + 1);

    socket.on("newNotification", handleNewNotification);
    socket.on("newSignupRequest", handleNewSignupRequest);
    socket.on("newPost", handleNewPost);
    socket.on("receiveGroupMessage", handleNewGroupMessage);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("newSignupRequest", handleNewSignupRequest);
      socket.off("newPost", handleNewPost);
      socket.off("receiveGroupMessage", handleNewGroupMessage);
    };
  }, [fetchNotifications, fetchCounts, fetchUser]);

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav className="hidden md:flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="text-2xl font-bold">Alumni Portal</div>
        <div className="flex space-x-8 items-center text-2xl">
          <Link href="/dashboard/admin" onClick={() => markSectionAsSeen("admin-requests")} className="hover:text-gray-200 relative group" title="Admin Panel">
            <FaUserShield className={adminSignupRequestsCount > 0 ? "text-orange-500 transition-colors" : "text-yellow-300"} />
            {adminSignupRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
          </Link>
          <Link href="/dashboard" onClick={() => markSectionAsSeen("home")} className="hover:text-gray-200 relative group" title="Home">
            <FaHome className={newPostsCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {newPostsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <Link href="/dashboard/network" onClick={() => markSectionAsSeen("network")} className="hover:text-gray-200 relative group" title="Network">
            <FaUserFriends className={pendingRequestsCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <Link href="/dashboard/groups" onClick={() => markSectionAsSeen("groups")} className="hover:text-gray-200 relative group" title="Groups">
            <FaUsers className={unreadGroupMessagesCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {unreadGroupMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <div
            className="relative group"
            onMouseEnter={() => pathname !== "/dashboard/notifications" && setShowNotifPreview(true)}
            onMouseLeave={() => setShowNotifPreview(false)}
          >
            <Link href="/dashboard/notifications" className="hover:text-gray-200 block" title="Notifications">
              <FaBell className={unreadCount > 0 ? "text-orange-500 transition-colors" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
            <AnimatePresence>
              {showNotifPreview && (
                <NotificationPreview
                  notifications={notifications}
                  darkMode={true}
                />
              )}
            </AnimatePresence>
          </div>
          <Link href="/dashboard/profile" className="hover:text-gray-200 relative group" title="Profile">
            <FaUserCircle />
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-gray-200 relative group pt-1"
              title="Settings"
            >
              <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="flex md:hidden justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-3 shadow-md sticky top-0 z-50">
        <div className="text-xl font-bold">Alumni Portal (Admin)</div>
        <button onClick={() => setShowSettings(true)} className="text-2xl pt-1">
          <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
        </button>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 px-6 py-3 z-50 flex justify-between items-center text-2xl text-gray-500 dark:text-gray-400">
        <Link href="/dashboard" onClick={() => markSectionAsSeen("home")} className={`${pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaHome className={newPostsCount > 0 ? "text-orange-500" : ""} />
          {newPostsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/network" onClick={() => markSectionAsSeen("network")} className={`${pathname === "/dashboard/network" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaUserFriends className={pendingRequestsCount > 0 ? "text-orange-500" : ""} />
          {pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/groups" onClick={() => markSectionAsSeen("groups")} className={`${pathname === "/dashboard/groups" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaUsers className={unreadGroupMessagesCount > 0 ? "text-orange-500" : ""} />
          {unreadGroupMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/notifications" className={`${pathname === "/dashboard/notifications" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaBell className={unreadCount > 0 ? "text-orange-500" : ""} />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/admin" onClick={() => markSectionAsSeen("admin-requests")} className={`${pathname.startsWith("/dashboard/admin") ? "text-orange-500" : ""} relative`}>
          <FaUserShield />
          {adminSignupRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/profile" className={pathname === "/dashboard/profile" ? "text-blue-600 dark:text-blue-400" : ""}>
          <FaUserCircle />
        </Link>
      </nav>

      <SettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetPassword={() => setShowResetModal(true)}
        onSignout={handleSignout}
      />
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  );
}
