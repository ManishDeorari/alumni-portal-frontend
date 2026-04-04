"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MessageSquare, UserPlus, Eye, ShieldAlert, Bell, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getNotificationIcon = (type, darkMode) => {
    const iconClass = "w-3 h-3";
    const { Award } = require("lucide-react");
    switch (type) {
        case "post_like":
        case "post_comment":
        case "comment_like":
        case "comment_reply":
        case "reply_like":
        case "comment_reaction":
        case "reply_reaction":
            return <MessageSquare className={`${iconClass} ${darkMode ? "text-blue-400" : "text-blue-600"}`} />;
        case "connect_request":
        case "connect_accept":
            return <UserPlus className={`${iconClass} ${darkMode ? "text-green-400" : "text-green-600"}`} />;
        case "profile_visit":
            return <Eye className={`${iconClass} ${darkMode ? "text-purple-400" : "text-purple-600"}`} />;
        case "admin_notice":
            return <ShieldAlert className={`${iconClass} ${darkMode ? "text-red-400" : "text-red-600"}`} />;
        case "points_earned":
            return <Award className={`${iconClass} ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />;
        default:
            return <Bell className={`${iconClass} ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />;
    }
};

export default function NotificationPreview({ notifications = [], darkMode }) {
    // Helper to check if a notification is unread
    const isNoteUnread = (note) => {
        return note.isRead === false || note.isRead === "false" || note.isRead === 0;
    };

    // Get the absolute latest 5 notifications (sorted by date)
    const latestNotifications = [...notifications]
        .filter(isNoteUnread)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className={`absolute top-full right-0 mt-3.5 w-80 rounded-[2rem] shadow-2xl overflow-hidden border ${darkMode ? "bg-[#121213]/98 border-white/20 backdrop-blur-2xl" : "bg-[#FAFAFA] border-gray-200"
                } z-[200]`}
        >
            {/* Hover Bridge */}
            <div className="absolute -top-6 left-0 w-full h-6 bg-transparent cursor-default" />

            <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? "border-white/10 bg-[#FAFAFA]/5" : "border-gray-100 bg-gray-50"}`}>
                <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${darkMode ? "text-white/60" : "text-gray-500"}`}>
                    Notification Center
                </h3>
                {latestNotifications.some(n => isNoteUnread(n)) && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">
                        Live Update
                    </span>
                )}
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                    {latestNotifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {latestNotifications.map((note) => {
                                const unread = isNoteUnread(note);
                                return (
                                    <motion.div
                                        key={note._id || Math.random()}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", damping: 30, stiffness: 500 }}
                                    >
                                        <Link
                                            href="/dashboard/notifications"
                                            className={`group flex gap-4 p-5 transition-all duration-300 ${unread
                                                    ? (darkMode ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50/60 hover:bg-blue-100/60")
                                                    : (darkMode ? "hover:bg-white/5" : "hover:bg-gray-50")
                                                }`}
                                        >
                                            <div className="flex-shrink-0 relative">
                                                <div className={`p-0.5 rounded-xl border-2 transition-all duration-300 ${unread ? "border-blue-500 shadow-lg shadow-blue-500/40" : "border-transparent opacity-80"}`}>
                                                    <Image
                                                        src={note.sender?.profilePicture || "/default-profile.jpg"}
                                                        alt={note.sender?.name || "User"}
                                                        width={44}
                                                        height={44}
                                                        className="w-11 h-11 rounded-[0.8rem] object-cover"
                                                    />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 ${darkMode ? "bg-slate-800 border-slate-900" : "bg-[#FAFAFA] border-gray-100"} shadow-sm`}>
                                                    {getNotificationIcon(note.type, darkMode)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] leading-[1.4] ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                    <span className={`font-extrabold ${unread && !darkMode ? "text-blue-900" : ""}`}>
                                                        {note.type === "points_earned" ? "System" : (note.sender?.name || (typeof note.sender === "string" ? "User" : "System"))}
                                                    </span>{" "}
                                                    <span className={`${unread ? (darkMode ? "text-white" : "text-gray-800 font-semibold") : (darkMode ? "text-white/70" : "text-gray-600")} font-medium`}>
                                                        {note.message?.startsWith("MANUAL_AWARD::") ? (() => {
                                                            const parts = note.message.split("::");
                                                            const msg = parts[1] || "Points Awarded";
                                                            const pts = parts[3] || "0";
                                                            const cat = (parts[2] || "Other").replace(/([A-Z])/g, ' $1').trim();
                                                            return `${msg} +${pts} PTS (${cat})`;
                                                        })() : note.message?.startsWith("SESSION_AWARD::") ? (() => {
                                                            const pts = note.message.split("::")[1] || "0";
                                                            return `Congratulations! Your session has been approved for +${pts} PTS (Campus Engagement)`;
                                                        })() : note.message}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-100"}`}>
                                                        <Clock className={`w-2.5 h-2.5 ${darkMode ? "text-white/30" : "text-gray-400"}`} />
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-white/30" : "text-gray-400"}`}>
                                                            {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                                                        </span>
                                                    </div>
                                                    {unread && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`self-center transition-all ${unread ? "opacity-100" : "opacity-0 group-hover:opacity-100"} translate-x-1 group-hover:translate-x-0`}>
                                                <ChevronRight className={`w-4 h-4 ${unread ? "text-blue-500" : (darkMode ? "text-white/20" : "text-gray-300")}`} />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center group">
                            <div className="mb-6 flex justify-center opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all">
                                <Bell className={`w-14 h-14 ${darkMode ? "text-white" : "text-gray-900"}`} />
                            </div>
                            <p className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? "text-white/30" : "text-gray-400"}`}>
                                Inbox Zero ✨
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Link
                href="/dashboard/notifications"
                className={`block text-center py-5 text-[10px] font-black uppercase tracking-[0.3em] border-t transition-all ${darkMode
                    ? "bg-[#FAFAFA]/[0.02] border-white/20 text-blue-400 hover:bg-[#FAFAFA]/10 hover:text-blue-300"
                    : "bg-gray-50 border-gray-100 text-blue-600 hover:bg-gray-100 hover:text-blue-700"
                    }`}
            >
                Enter Notifications Center
            </Link>
        </motion.div>
    );
}
