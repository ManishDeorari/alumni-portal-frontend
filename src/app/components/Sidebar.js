"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey, FaUsers } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import SettingsDrawer from "./SettingsDrawer";
import NotificationPreview from "./NotificationPreview";
import socket from "@/utils/socket";
import { AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadGroupMessagesCount, setUnreadGroupMessagesCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [adminSignupRequestsCount, setAdminSignupRequestsCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shakeNotification, setShakeNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showNotifPreview, setShowNotifPreview] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchNotifications = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Ensure each notification has an isRead property for consistent filtering
        const normalized = data.map(n => ({
          ...n,
          isRead: n.isRead === true || n.isRead === "true" || n.isRead === 1 || n.isRead === "1"
        }));
        setNotifications(normalized);
        const unread = normalized.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL]);

  const fetchCounts = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/counts/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNewPostsCount(data.unreadPostsCount);
        setPendingRequestsCount(data.pendingRequestsCount);
        setUnreadGroupMessagesCount(data.unreadGroupMessagesCount);
        setUnreadCount(data.unreadNotificationsCount);
        setAdminSignupRequestsCount(data.adminSignupRequestsCount);
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
      // Update local state immediately for better UX
      if (section === "posts" || section === "home") setNewPostsCount(0);
      if (section === "network") setPendingRequestsCount(0);
      if (section === "groups") setUnreadGroupMessagesCount(0);
    } catch (err) {
      console.error(`Failed to mark ${section} as seen:`, err);
    }
  };


  const fetchUserRole = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const userData = await res.json();
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.role === "admin" || userData.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user role:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    setIsAdmin(user.role === "admin" || user.isAdmin);
    const token = localStorage.getItem("token");

    fetchNotifications(token);
    fetchCounts(token);
    fetchUserRole(token);

    socket.emit("join", user._id);

    const handleNewNotification = (notification) => {
      const newNotif = { ...notification, isRead: false };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      setShakeNotification(true);
      setTimeout(() => setShakeNotification(false), 1000);
      if (notification.type === "connect_request") {
        setPendingRequestsCount(prev => prev + 1);
      }
    };

    const handleNewPost = () => setNewPostsCount(prev => prev + 1);
    const handleNewGroupMessage = () => setUnreadGroupMessagesCount(prev => prev + 1);
    const handleNewSignupRequest = () => setAdminSignupRequestsCount(prev => prev + 1);

    socket.on("newNotification", handleNewNotification);
    socket.on("newPost", handleNewPost);
    socket.on("receiveGroupMessage", handleNewGroupMessage);
    socket.on("newSignupRequest", handleNewSignupRequest);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("newPost", handleNewPost);
      socket.off("receiveGroupMessage", handleNewGroupMessage);
      socket.off("newSignupRequest", handleNewSignupRequest);
    };
  }, [API_URL, fetchNotifications, fetchCounts, fetchUserRole]);

  // Clear new posts indicator when visiting home
  const handleHomeClick = () => {
    markSectionAsSeen("home");
  };
  const handleNetworkClick = () => {
    markSectionAsSeen("network");
  };
  const handleGroupsClick = () => {
    markSectionAsSeen("groups");
  };

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <>
      {/* Top Navbar - Hidden on Mobile, Visible on Desktop */}
      <nav className="hidden md:flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md贯 sticky top-0 z-50">
        {/* Logo or App Name */}
        <div className="text-2xl font-bold">
          Alumni Portal
        </div>

        {/* Navigation Links - Icon Only */}
        <div className="flex space-x-8 items-center text-2xl">
          {/* Admin (Only for admins) */}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className="hover:text-gray-200 relative group"
              onClick={() => markSectionAsSeen("admin-requests")}
              title="Admin Panel"
            >
              <FaUserShield className={adminSignupRequestsCount > 0 ? "text-orange-500" : "text-yellow-300"} />
              {adminSignupRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </Link>
          )}

          {/* Home */}
          <Link
            href="/dashboard"
            className="hover:text-gray-200 relative group"
            onClick={handleHomeClick}
            title="Home"
          >
            <FaHome className={newPostsCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {newPostsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
          </Link>

          {/* Network */}
          <Link
            href="/dashboard/network"
            className="hover:text-gray-200 relative group"
            onClick={handleNetworkClick}
            title="Network"
          >
            <FaUserFriends className={pendingRequestsCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
          </Link>

          {/* Groups */}
          <Link
            href="/dashboard/groups"
            className="hover:text-gray-200 relative group"
            onClick={handleGroupsClick}
            title="Groups"
          >
            <FaUsers className={unreadGroupMessagesCount > 0 ? "text-orange-500 transition-colors" : ""} />
            {unreadGroupMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
          </Link>

          {/* Notifications */}
          <div
            className="relative group"
            onMouseEnter={() => pathname !== "/dashboard/notifications" && setShowNotifPreview(true)}
            onMouseLeave={() => setShowNotifPreview(false)}
          >
            <Link
              href="/dashboard/notifications"
              className="hover:text-gray-200 block"
              title="Notifications"
            >
              <FaBell className={`${unreadCount > 0 ? "text-orange-500" : ""} ${shakeNotification ? "animate-shake" : ""} transition-colors`} />
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

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className="hover:text-gray-200 relative group"
            title="Profile"
          >
            <FaUserCircle />
          </Link>

          {/* Settings */}
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

      {/* Mobile Top Bar - Only Logo and Settings */}
      <nav className="flex md:hidden justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-3 shadow-md sticky top-0 z-50">
        <div className="text-xl font-bold">Alumni Portal</div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-2xl pt-1"
        >
          <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
        </button>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121213] border-t border-gray-200 dark:border-white/10 px-6 py-3 z-50 flex justify-between items-center text-2xl text-gray-500 dark:text-gray-400">
        {/* Home */}
        <Link href="/dashboard" onClick={handleHomeClick} className={`${pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaHome className={newPostsCount > 0 ? "text-orange-500" : ""} />
          {newPostsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Network */}
        <Link href="/dashboard/network" onClick={handleNetworkClick} className={`${pathname === "/dashboard/network" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaUserFriends className={pendingRequestsCount > 0 ? "text-orange-500" : ""} />
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Groups */}
        <Link href="/dashboard/groups" onClick={handleGroupsClick} className={`${pathname === "/dashboard/groups" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaUsers className={unreadGroupMessagesCount > 0 ? "text-orange-500" : ""} />
          {unreadGroupMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Notifications */}
        <Link href="/dashboard/notifications" className={`${pathname === "/dashboard/notifications" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaBell className={unreadCount > 0 ? "text-orange-500" : ""} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Profile */}
        <Link href="/dashboard/profile" className={pathname === "/dashboard/profile" ? "text-blue-600 dark:text-blue-400" : ""}>
          <FaUserCircle />
        </Link>

        {/* Admin Link if applicable */}
        {isAdmin && (
          <Link href="/dashboard/admin" onClick={() => markSectionAsSeen("admin-requests")} className={`${pathname.startsWith("/dashboard/admin") ? "text-yellow-500" : ""} relative`}>
            <FaUserShield />
            {adminSignupRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
        )}
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
