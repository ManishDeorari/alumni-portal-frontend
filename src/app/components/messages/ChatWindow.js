"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function ChatWindow({
    selectedUser,
    messages,
    currentUser,
    onSendMessage,
    newMessage,
    setNewMessage
}) {
    const { darkMode } = useTheme();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        onSendMessage(newMessage);
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 h-[calc(100vh-140px)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-40" />
                <div className={`relative h-full flex flex-col items-center justify-center rounded-[14px] ${darkMode ? "bg-gray-900/95" : "bg-white/95"
                    }`}>
                    <div className={`text-center p-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <div className="text-7xl mb-6 animate-bounce">💬</div>
                        <h2 className={`text-3xl font-black mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Select a conversation</h2>
                        <p className="max-w-xs mx-auto text-lg opacity-80 font-medium">Connect with your alumni network and start chatting!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-[calc(100vh-140px)]">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

            <div className={`h-full flex flex-col rounded-[14px] relative overflow-hidden ${darkMode ? "bg-gray-900/95 text-white" : "bg-white/95 text-gray-900"
                }`}>
                {/* Header */}
                <div className="p-4 flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm">
                            <Image
                                src={selectedUser.profilePicture || "/default-profile.jpg"}
                                width={40}
                                height={40}
                                className="rounded-full object-cover bg-white"
                                alt={selectedUser.name}
                            />
                        </div>
                        <div>
                            <h3 className={`font-black ${darkMode ? "text-white" : "text-gray-800"}`}>{selectedUser.name}</h3>
                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Online
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gradient Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, index) => {
                        // Robust ID comparison helper
                        const getUserId = (u) => {
                            if (!u) return null;
                            if (typeof u === 'string') return u;
                            return u._id || u.id;
                        };

                        const senderId = getUserId(msg.sender);
                        const currentId = getUserId(currentUser);
                        const isMe = senderId && currentId && String(senderId) === String(currentId);

                        return (
                            <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] p-4 rounded-3xl shadow-md relative transition-all hover:shadow-lg ${isMe
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                                    : (darkMode ? "bg-gray-800 text-white rounded-tl-none border border-white/10" : "bg-blue-50/50 text-gray-800 rounded-tl-none border border-blue-100")
                                    }`}>
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-wider block mt-2 opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && msg.read && " • Read"}
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
                    <form onSubmit={handleSend} className="flex items-center gap-3">
                        <button type="button" className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${darkMode ? "text-gray-400 hover:bg-white" : "text-gray-500 hover:bg-gray-200"}`}>
                            <FaSmile size={20} />
                        </button>
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
                </div>
            </div>
        </div>
    );
}
