"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import SettingsDrawer from "./SettingsDrawer";

export default function AdminSidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">

      {/* Logo or App Name */}
      <div className="text-2xl font-bold">Alumni Portal</div>

      {/* Navigation Links - Icon Only */}
      <div className="flex space-x-8 items-center text-2xl">
        {/* Admin-specific page */}
        <Link href="/dashboard/admin" className="hover:text-gray-200 relative group" title="Admin Panel">
          <FaUserShield />
        </Link>

        {/* Common links for all users */}
        <Link href="/dashboard" className="hover:text-gray-200 relative group" title="Home">
          <FaHome />
        </Link>

        <Link href="/dashboard/network" className="hover:text-gray-200 relative group" title="Network">
          <FaUserFriends />
        </Link>

        <Link href="/dashboard/messages" className="hover:text-gray-200 relative group" title="Messages">
          <FaEnvelope />
        </Link>

        <Link href="/dashboard/notifications" className="hover:text-gray-200 relative group" title="Notifications">
          <FaBell />
        </Link>

        <Link href="/dashboard/profile" className="hover:text-gray-200 relative group" title="Profile">
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
    </nav>
  );
}
