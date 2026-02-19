"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey } from "react-icons/fa";
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
          isRead: n.isRead === true || n.isRead === "true"
        }));
        setNotifications(normalized);
        setUnreadCount(normalized.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL]);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    fetchNotifications(token);
    socket.emit("join", user._id);

    const handleNewNotification = (notification) => {
      const newNotif = { ...notification, isRead: false };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [fetchNotifications]);

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
          <Link href="/dashboard/admin" className="hover:text-gray-200 relative group" title="Admin Panel">
            <FaUserShield />
          </Link>
          <Link href="/dashboard" className="hover:text-gray-200 relative group" title="Home">
            <FaHome />
          </Link>
          <Link href="/dashboard/network" className="hover:text-gray-200 relative group" title="Network">
            <FaUserFriends />
          </Link>
          <Link href="/dashboard/messages" className="hover:text-gray-200 relative group" title="Messages">
            <FaEnvelope />
          </Link>
          <div
            className="relative group"
            onMouseEnter={() => pathname !== "/dashboard/notifications" && setShowNotifPreview(true)}
            onMouseLeave={() => setShowNotifPreview(false)}
          >
            <Link href="/dashboard/notifications" className="hover:text-gray-200 block" title="Notifications">
              <FaBell className={unreadCount > 0 ? "text-yellow-300" : ""} />
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
        <Link href="/dashboard" className={pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : ""}>
          <FaHome />
        </Link>
        <Link href="/dashboard/network" className={pathname === "/dashboard/network" ? "text-blue-600 dark:text-blue-400" : ""}>
          <FaUserFriends />
        </Link>
        <Link href="/dashboard/messages" className={pathname === "/dashboard/messages" ? "text-blue-600 dark:text-blue-400" : ""}>
          <FaEnvelope />
        </Link>
        <Link href="/dashboard/notifications" className={`${pathname === "/dashboard/notifications" ? "text-blue-600 dark:text-blue-400" : ""} relative`}>
          <FaBell className={unreadCount > 0 ? "text-yellow-500" : ""} />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/admin" className={pathname.startsWith("/dashboard/admin") ? "text-yellow-500" : ""}>
          <FaUserShield />
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
