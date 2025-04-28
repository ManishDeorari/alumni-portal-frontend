"use client";

import React from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope } from "react-icons/fa";

export default function Sidebar() {
  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      
      {/* Logo or App Name */}
      <div className="text-2xl font-bold">
        Alumni Portal
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 items-center text-lg">
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
      </div>
      
    </nav>
  );
}
