"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import { useRouter } from "next/navigation";
import PostCard from "../../components/Post/PostCard";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Layers,
  MessageSquare,
  UserPlus,
  Eye,
  ShieldAlert,
  CheckCheck,
  Calendar,
  Clock,
  ChevronRight,
  X
} from "lucide-react";

const TABS = [
  { id: "ALL", label: "All", icon: <Layers className="w-4 h-4" /> },
  { id: "POST", label: "Posts", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "NETWORK", label: "Network", icon: <UserPlus className="w-4 h-4" /> },
  { id: "VISIT", label: "Visits", icon: <Eye className="w-4 h-4" /> },
  { id: "NOTICE", label: "Notice", icon: <ShieldAlert className="w-4 h-4" /> },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchNotifications = useCallback(async () => {
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
  }, [API_URL]);

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user
        const userRes = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch notifications
        fetchNotifications();
      } catch (err) {
        console.error("Error initializing Notifications page:", err);
      }
    };

    fetchUserAndNotes();
  }, [API_URL, fetchNotifications]);

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

  const handleNotificationClick = async (note) => {
    if (!note.isRead) markAsRead(note._id);

    if (note.type === "connect_request" || note.type === "connect_accept") {
      router.push(`/dashboard/profile?id=${note.sender?._id || note.sender}`);
    } else if (note.type === "profile_visit") {
      router.push(`/dashboard/profile?id=${note.sender?._id || note.sender}`);
    } else if (note.postId) {
      try {
        const res = await fetch(`${API_URL}/api/posts/${note.postId._id || note.postId}`);
        const postData = await res.json();
        if (res.ok) {
          setSelectedPost(postData);
          setShowPostModal(true);
        } else {
          console.error("Post not found or deleted");
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    }
  };

  // Logic to filter and group notifications
  const filteredAndGroupedNotifications = useMemo(() => {
    let filtered = notifications;

    // 1. Filter by Tab
    if (activeTab === "POST") {
      filtered = notifications.filter(n => ["post_like", "post_comment", "comment_like", "comment_reply", "reply_like", "comment_reaction", "reply_reaction"].includes(n.type));
    } else if (activeTab === "NETWORK") {
      filtered = notifications.filter(n => ["connect_request", "connect_accept"].includes(n.type));
    } else if (activeTab === "VISIT") {
      filtered = notifications.filter(n => n.type === "profile_visit");
    } else if (activeTab === "NOTICE") {
      filtered = notifications.filter(n => n.type === "admin_notice");
    }

    // 2. Group by Time
    const groups = {
      NEW: { label: "New Notifications", items: [], icon: <Bell className="w-4 h-4 text-yellow-400" /> },
      TODAY: { label: "Today", items: [], icon: <Clock className="w-4 h-4 text-blue-400" /> },
      YESTERDAY: { label: "Yesterday", items: [], icon: <Calendar className="w-4 h-4 text-purple-400" /> },
      OLDER: { label: "Older", items: [], icon: <Clock className="w-4 h-4 text-gray-400" /> },
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach(note => {
      const noteDate = new Date(note.createdAt);
      const isRead = note.isRead;

      if (!isRead) {
        groups.NEW.items.push(note);
      } else if (noteDate >= today) {
        groups.TODAY.items.push(note);
      } else if (noteDate >= yesterday) {
        groups.YESTERDAY.items.push(note);
      } else {
        groups.OLDER.items.push(note);
      }
    });

    return Object.entries(groups).filter(([_, group]) => group.items.length > 0);
  }, [notifications, activeTab]);

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const userObj = user || JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white pb-20">
      <SidebarComponent />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-yellow-400 text-blue-900 text-xs px-2.5 py-1 rounded-full items-center font-bold">
                  {notifications.filter(n => !n.isRead).length} New
                </span>
              )}
            </h1>
            <p className="text-white/70 mt-2 font-medium">Keep track of your community interactions</p>
          </div>
          <button
            onClick={markAllRead}
            disabled={!notifications.some(n => !n.isRead)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 rounded-xl transition-all font-semibold backdrop-blur-md text-white"
          >
            <CheckCheck className="w-5 h-5 text-yellow-400" />
            Mark all read
          </button>
        </div>

        {/* Subsections (Tabs) */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-white text-blue-600 shadow-lg shadow-black/20"
                : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 backdrop-blur-md rounded-3xl p-16 text-center border border-white/10"
          >
            <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-white opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No notifications found</h2>
            <p className="text-white/60 max-w-xs mx-auto text-sm">When you get likes, comments, or connection requests, they&apos;ll show up here.</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {filteredAndGroupedNotifications.map(([key, group]) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  {group.icon}
                  <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">
                    {group.label}
                  </h3>
                  <div className="h-[1px] flex-1 bg-white/10 ml-4"></div>
                </div>

                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((note) => (
                      <motion.div
                        layout
                        key={note._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => handleNotificationClick(note)}
                        className={`group relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all border ${!note.isRead
                          ? "bg-black/40 border-white/30 shadow-xl hover:bg-black/50"
                          : "bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20"
                          } backdrop-blur-md`}
                      >
                        <div className="relative">
                          <Image
                            src={note.sender?.profilePicture || "/default-profile.jpg"}
                            alt={note.sender?.name || "User"}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 group-hover:border-white transition-colors"
                          />
                          {!note.isRead && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-blue-600 shadow-lg shadow-yellow-400/50"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-white font-semibold text-lg leading-tight">
                                {note.sender?.name || "System"} <span className="font-medium text-white/80 ml-1">{note.message}</span>
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs font-bold text-white/50 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-xs font-bold text-white/50 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>

                        {!note.isRead && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-yellow-400 rounded-l-2xl"></div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 text-slate-900"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all active:scale-90 border border-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6">
                {user && (
                  <PostCard
                    post={selectedPost}
                    currentUser={user}
                    setPosts={(updater) => {
                      if (typeof updater === 'function') {
                        setSelectedPost(prev => updater([prev])[0] || updater(prev));
                      } else {
                        setSelectedPost(Array.isArray(updater) ? updater[0] : updater);
                      }
                    }}
                    initialShowComments={true}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// X is now imported from lucide-react

