"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { FaPaperPlane, FaSmile, FaInfoCircle, FaUserPlus, FaUsers } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import EmojiPicker from 'emoji-picker-react';

export default function GroupChatWindow({
    selectedGroup,
    messages,
    currentUser,
    onSendMessage,
    newMessage,
    setNewMessage,
    onEditGroup,
    onInviteMembers,
    isAdmin,
    onReact
}) {
    const { darkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        onSendMessage(newMessage);
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    if (!selectedGroup) {
        return (
            <div className="flex-1 relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 h-[calc(100vh-140px)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-40" />
                <div className={`relative h-full flex flex-col items-center justify-center rounded-[14px] ${darkMode ? "bg-gray-900/95" : "bg-white/95"
                    }`}>
                    <div className={`text-center p-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <div className="text-7xl mb-6 animate-bounce">👥</div>
                        <h2 className={`text-3xl font-black mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Select a Group</h2>
                        <p className="max-w-xs mx-auto text-lg opacity-80 font-medium">Join or select a group to start communicating with your alumni network!</p>
                    </div>
                </div>
            </div>
        );
    }

    const canMessage = isAdmin || currentUser?.role !== "faculty" || selectedGroup.allowFacultyMessaging;

    return (
        <div className="flex-1 relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-[calc(100vh-140px)]">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

            <div className={`h-full flex flex-col rounded-[14px] relative overflow-hidden ${darkMode ? "bg-gray-900/95 text-white" : "bg-white/95 text-gray-900"
                }`}>
                {/* Header */}
                <div className="p-4 flex items-center justify-between relative bg-black/5">
                    <div className="flex items-center gap-3">
                        <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm w-10 h-10 flex items-center justify-center overflow-hidden bg-white">
                            {selectedGroup.profileImage ? (
                                <Image
                                    src={selectedGroup.profileImage}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    alt={selectedGroup.name}
                                />
                            ) : (
                                <FaUsers className="text-gray-400" size={20} />
                            )}
                        </div>
                        <div>
                            <h3 className={`font-black ${darkMode ? "text-white" : "text-gray-800"}`}>{selectedGroup.name}</h3>
                            <p className={`text-[10px] font-bold truncate max-w-[200px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {selectedGroup.description || "Group Chat"}
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button 
                                onClick={onInviteMembers}
                                className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Invite Members"
                            >
                                <FaUserPlus size={18} />
                            </button>
                            <button 
                                onClick={onEditGroup}
                                className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Group Settings"
                            >
                                <FaInfoCircle size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Gradient Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {messages.map((msg, index) => {
                        const isMe = String(msg.sender?._id || msg.sender?.id || msg.sender) === String(currentUser?._id || currentUser?.id);

                        return (
                            <div key={msg._id || index} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                {!isMe && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-gray-200 mt-1">
                                        <Image
                                            src={msg.sender?.profilePicture || "/default-profile.jpg"}
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                            alt={msg.sender?.name || "User"}
                                        />
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                                    {!isMe && (
                                        <span className="text-[10px] font-black uppercase tracking-wider mb-1 ml-1 opacity-70">
                                            {msg.sender?.name || "Unknown"} • {msg.sender?.role || "Alumni"}
                                        </span>
                                    )}
                                    <div className="group relative">
                                        <div className={`p-3 rounded-2xl shadow-sm relative transition-all hover:shadow-md ${isMe
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                                            : (darkMode ? "bg-gray-800 text-white rounded-tl-none border border-white/10" : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm")
                                            }`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            
                                            {/* Reactions Display */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {msg.reactions.map((r, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => onReact(msg._id, r.emoji)}
                                                            className={`px-1.5 py-0.5 rounded-full text-[10px] border cursor-pointer flex items-center gap-1 ${
                                                                r.users.includes(currentUser?._id) 
                                                                ? "bg-blue-500/20 border-blue-500/50" 
                                                                : "bg-black/5 border-transparent"
                                                            }`}
                                                        >
                                                            <span>{r.emoji}</span>
                                                            <span className="font-bold">{r.users.length}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Quick Reaction Button (Hover) */}
                                        <div className={`absolute top-0 ${isMe ? "right-full mr-2" : "left-full ml-2"} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                            {['👍', '❤️', '🔥', '👏'].map(emoji => (
                                                <button 
                                                    key={emoji}
                                                    onClick={() => onReact(msg._id, emoji)}
                                                    className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-md hover:scale-125 transition-transform text-xs"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider mt-1.5 opacity-40 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Gradient Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                {/* Input Area */}
                <div className="p-4 bg-black/5">
                    {canMessage ? (
                        <form onSubmit={handleSend} className="flex items-center gap-3 relative">
                            <div className="relative" ref={emojiPickerRef}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${darkMode ? "text-gray-400 hover:bg-white" : "text-gray-500 hover:bg-gray-200"}`}
                                >
                                    <FaSmile size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 z-50">
                                        <EmojiPicker 
                                            onEmojiClick={onEmojiClick}
                                            theme={darkMode ? 'dark' : 'light'}
                                            width={300}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 relative p-[1px] rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-inner focus-within:shadow-md transition-all">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className={`w-full rounded-full px-5 py-2.5 font-bold text-sm focus:outline-none transition-colors ${darkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-gray-900 placeholder-gray-400"
                                        }`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <FaPaperPlane size={18} />
                            </button>
                        </form>
                    ) : (
                        <div className="p-3 text-center bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest">
                             Messaging is disabled for faculty in this group
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
