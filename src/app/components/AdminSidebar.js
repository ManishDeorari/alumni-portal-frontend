"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";

export default function AdminSidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">

      {/* Logo or App Name */}
      <div className="text-2xl font-bold">Alumni Portal</div>

      {/* Navigation Links */}
      <div className="flex space-x-6 items-center text-lg">
        {/* Admin-specific page */}
        <Link href="/dashboard/admin" className="hover:text-gray-200 flex items-center space-x-1">
          <FaUserShield />
          <span>Admin</span>
        </Link>

        {/* Common links for all users */}
        <Link href="/dashboard" className="hover:text-gray-200 flex items-center space-x-1">
          <FaHome />
          <span>Home</span>
        </Link>

        <Link href="/dashboard/network" className="hover:text-gray-200 flex items-center space-x-1">
          <FaUserFriends />
          <span>Network</span>
        </Link>

        <Link href="/dashboard/messages" className="hover:text-gray-200 flex items-center space-x-1">
          <FaEnvelope />
          <span>Messages</span>
        </Link>

        <Link href="/dashboard/notifications" className="hover:text-gray-200 flex items-center space-x-1">
          <FaBell />
          <span>Notifications</span>
        </Link>

        <Link href="/dashboard/profile" className="hover:text-gray-200 flex items-center space-x-1">
          <FaUserCircle />
          <span>Profile</span>
        </Link>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hover:text-gray-200 flex items-center space-x-1 group pt-1"
            title="Settings"
          >
            <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
            <span>Settings</span>
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
