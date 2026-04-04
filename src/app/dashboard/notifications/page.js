"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import PostCard from "../../components/Post/PostCard";
import Image from "next/image";
import socket from "@/utils/socket";
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
  X,
  Users,
  Award
} from "lucide-react";

const TABS = [
  { id: "ALL", label: "All", icon: <Layers className="w-4 h-4" /> },
  { id: "POST", label: "Posts", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "GROUP", label: "Groups", icon: <Users className="w-4 h-4" /> },
  { id: "NETWORK", label: "Network", icon: <UserPlus className="w-4 h-4" /> },
  { id: "VISIT", label: "Visits", icon: <Eye className="w-4 h-4" /> },
  { id: "POINTS", label: "Points", icon: <Award className="w-4 h-4" /> },
  { id: "NOTICE", label: "Notice", icon: <ShieldAlert className="w-4 h-4" /> },
];

import { useNotifications } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const { darkMode } = useTheme();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications 
  } = useNotifications();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ⚡ OPTIMISTIC HYDRATION
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false); // Can show UI immediately if we have a cached user
    }
  }, []);

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user profile to ensure permissions/role are up to date
        const userRes = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Sync cache
        }
        
        // Notification context manages fetching notifications; we just trigger a refresh
        refreshNotifications();
      } catch (err) {
        console.error("Error initializing Notifications page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, [API_URL, refreshNotifications]);

  const handleNotificationClick = async (note) => {
    if (note.isRead) return; // Prevent clicking on read notifications
    markAsRead(note._id);

    if (note.type === "connect_request" || note.type === "connect_accept") {
      router.push(`/profile/${note.sender?._id || note.sender}`);
    } else if (note.type === "profile_visit") {
      router.push(`/profile/${note.sender?._id || note.sender}`);
    } else if (note.type === "group_joined" || note.type === "group_added") {
      router.push("/dashboard/groups");
    } else if (note.type === "points_earned") {
      // Allow it to fall through to note.postId logic
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
    } else if (activeTab === "POINTS") {
      filtered = notifications.filter(n => n.type === "points_earned");
    } else if (activeTab === "GROUP") {
      filtered = notifications.filter(n => ["group_joined", "group_added", "group_removed", "group_disbanded"].includes(n.type));
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
    <div className={`min-h-screen pb-20 bg-gradient-to-br from-blue-600 to-purple-700`}>
      <SidebarComponent />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-4xl font-black tracking-tight flex items-center gap-3 text-white`}>
              Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full items-center font-bold shadow-lg shadow-blue-500/20">
                  {notifications.filter(n => !n.isRead).length} New
                </span>
              )}
            </h1>
            <p className={`mt-2 font-medium text-white/80`}>Keep track of your community interactions</p>
          </div>
          <div className={`relative p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all shadow-sm ${!notifications.some(n => !n.isRead) ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <button
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.isRead)}
              className={`flex items-center gap-2 px-6 py-2.5 w-full h-full rounded-[calc(0.75rem-2px)] transition-all duration-300 font-bold backdrop-blur-md ${
                darkMode 
                  ? 'bg-black hover:bg-black/80 text-white' 
                  : 'bg-white hover:bg-gray-50 text-slate-700 hover:text-blue-600'
              } disabled:cursor-not-allowed active:scale-95`}
            >
              <CheckCheck className="w-5 h-5 text-blue-500" />
              Mark all read
            </button>
          </div>
        </div>

        {/* Subsections (Tabs) */}
        <div className="relative p-[2px] mb-8 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-fit shadow-md">
          <div className={`flex flex-wrap gap-2 p-1.5 rounded-[calc(1rem-2px)] w-full backdrop-blur-xl ${darkMode ? 'bg-black/90' : 'bg-white'}`}>
            {TABS.filter(tab => {
              if (tab.id === "POINTS") {
                const userRole = user?.role || JSON.parse(localStorage.getItem("user") || "{}")?.role;
                return userRole === "alumni";
              }
              return true;
            }).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                  ? (darkMode ? "bg-white/10 text-blue-400 shadow-lg shadow-black/20" : "bg-blue-50 text-blue-600 shadow-md border border-blue-200")
                  : (darkMode ? "text-white/60 hover:text-white hover:bg-[#FAFAFA]/10" : "text-slate-500 hover:text-slate-700 hover:bg-gray-50")
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-16 text-center border relative overflow-hidden p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-xl`}
          >
            <div className={`p-16 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black' : 'bg-[#FAFAFA]'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-[#FAFAFA]/5 text-white/50' : 'bg-gray-50 text-slate-300'}`}>
                <Bell className="w-10 h-10" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>No notifications found</h2>
              <p className={`${darkMode ? 'text-white/40' : 'text-slate-500'} max-w-xs mx-auto text-sm`}>When you get likes, comments, or connection requests, they&apos;ll show up here.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {filteredAndGroupedNotifications.map(([key, group]) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  {group.icon}
                  <h3 className={`text-sm font-black uppercase tracking-widest text-white`}>
                    {group.label}
                  </h3>
                  <div className={`h-[1px] flex-1 ml-4 ${darkMode ? 'bg-[#FAFAFA]/20' : 'bg-[#FAFAFA]/40'}`}></div>
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((note) => (
                      <motion.div
                        layout
                        key={note._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => handleNotificationClick(note)}
                        className={`relative p-[2px] bg-gradient-to-r ${note.type === 'points_earned' ? 'from-amber-400 via-yellow-500 to-amber-500' : 'from-blue-500 via-purple-500 to-pink-500'} rounded-2xl transition-all duration-300 group shadow-md`}
                      >
                        <div className={`relative flex items-start gap-4 p-5 rounded-[calc(1rem-2px)] transition-all ${
                          !note.isRead
                            ? (darkMode ? "bg-black/90 hover:bg-black" : "bg-[#FAFAFA] hover:bg-white shadow-md")
                            : (darkMode ? "bg-black/80 shadow-inner" : "bg-gray-50 shadow-inner")
                        } ${!note.isRead ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}>
                          <div className="relative shrink-0">
                            <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${note.type === 'points_earned' ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-purple-500'} shadow-[0_0_10px_rgba(255,255,255,0.1)] ${!note.isRead ? 'opacity-100' : 'opacity-80 grayscale-[20%]'}`}>
                              {note.type === "points_earned" ? (
                                <div className={`w-14 h-14 rounded-[0.9rem] flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                  <Award className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
                                </div>
                              ) : (
                                <Image
                                  src={note.sender?.profilePicture || "/default-profile.jpg"}
                                  alt={note.sender?.name || "User"}
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 rounded-[0.9rem] object-cover bg-[#FAFAFA]"
                                />
                              )}
                            </div>
                            {!note.isRead && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-col gap-1">
                                  {note.type === "points_earned" ? (
                                    <>
                                      <span className="font-black text-lg tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">System</span>
                                      {(() => {
                                        let msg = note.message;
                                        let cat = "Reward";
                                        let pts = "0";

                                        if (note.message?.startsWith("MANUAL_AWARD::")) {
                                          const parts = note.message.split("::");
                                          msg = parts[1] || "";
                                          cat = parts[2]?.replace(/([A-Z])/g, ' $1').trim() || "Reward";
                                          pts = parts[3] || "0";
                                        } else if (note.message?.startsWith("SESSION_AWARD::")) {
                                          const parts = note.message.split("::");
                                          pts = parts[1] || "0";
                                          msg = "Congratulations! Your session has been approved.";
                                          cat = "Campus Engagement";
                                        } else {
                                          const match = note.message?.match(/\+?(\d+)\s*(?:PTS|pts|points|Points)/i);
                                          if (match) {
                                              pts = match[1];
                                              msg = note.message.replace(match[0], '').trim() || "Points Earned";
                                          } else {
                                              const matchEnd = note.message?.match(/(\d+)$/);
                                              if (matchEnd) {
                                                pts = matchEnd[1];
                                                msg = note.message.replace(matchEnd[0], '').trim();
                                              } else {
                                                pts = "10";
                                              }
                                          }
                                        }

                                        // Apply categorical fallback if the system categorized it as a generic "Reward"
                                        if (cat === "Reward" || !cat) {
                                          const lowerMsg = msg?.toLowerCase() || note.message?.toLowerCase() || "";
                                          if (lowerMsg.includes("like")) cat = "Like";
                                          else if (lowerMsg.includes("comment")) cat = "Comment";
                                          else if (lowerMsg.includes("network") || lowerMsg.includes("connect")) cat = "Network";
                                          else if (lowerMsg.includes("announcement") || lowerMsg.includes("announce") || lowerMsg.includes("earned") || lowerMsg.includes("first")) cat = "Alumni Participation";
                                          else if (lowerMsg.includes("post")) cat = "Post";
                                          else cat = "Reward";
                                        }

                                        return (
                                          <div className="relative p-[2px] mt-2 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 shadow-md">
                                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full rounded-[calc(1rem-1px)] p-4 ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                                              <div className={`text-left font-bold text-sm sm:text-base leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                {msg}
                                              </div>
                                              <div className="flex justify-center relative">
                                                <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-sm">
                                                  <span className={`block font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full whitespace-nowrap ${darkMode ? 'bg-black text-blue-400' : 'bg-white text-purple-700'}`}>
                                                    {cat}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="text-right sm:text-right font-black text-xl sm:text-2xl tracking-tighter bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                                                +{pts} PTS
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-black text-lg tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                                        {note.sender?.name || "System"}
                                      </span>
                                      {(() => {
                                        let cat = "Notification";
                                        const typeStr = note.type || "";
                                        if (typeStr.includes("group")) cat = "Group";
                                        else if (typeStr.includes("comment") || typeStr.includes("reply")) cat = "Discussion";
                                        else if (typeStr.includes("post") || typeStr.includes("like") || typeStr.includes("reaction")) cat = "Post";
                                        else if (typeStr.includes("profile_visit")) cat = "Profile Visit";
                                        else if (typeStr.includes("connect")) cat = "Network";
                                        else if (typeStr.includes("notice")) cat = "Announcement";

                                        return (
                                          <div className="relative p-[2px] mt-2 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md">
                                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full rounded-[calc(1rem-1px)] p-4 ${darkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                                              <div className={`text-left font-bold text-sm sm:text-base leading-tight ${darkMode ? 'text-white' : 'text-slate-800'} sm:col-span-2`}>
                                                {note.message ? note.message.charAt(0).toUpperCase() + note.message.slice(1) : ""}
                                              </div>
                                              <div className="flex justify-end relative sm:col-span-1">
                                                <div className="p-[1px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
                                                  <span className={`block font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full whitespace-nowrap ${darkMode ? 'bg-black text-blue-400' : 'bg-white text-purple-700'}`}>
                                                    {cat}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-md ${darkMode ? 'bg-[#FAFAFA]/10 text-white/90' : 'bg-gray-200/50 text-slate-700'}`}>
                                    <Clock className="w-3 h-3" />
                                    {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-md ${darkMode ? 'bg-[#FAFAFA]/10 text-white/90' : 'bg-gray-200/50 text-slate-700'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className={`w-5 h-5 transition-all ${!note.isRead ? (darkMode ? 'text-white/20 group-hover:text-white' : 'text-slate-300 group-hover:text-blue-500') : 'opacity-0'} group-hover:translate-x-1`} />
                            </div>
                          </div>

                          {!note.isRead && (
                            <div className="absolute inset-y-4 left-0 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                          )}
                        </div>
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
              className="relative bg-[#FAFAFA] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 text-slate-900"
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

