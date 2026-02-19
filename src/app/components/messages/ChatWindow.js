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
            <div className={`flex-1 flex flex-col items-center justify-center border-2 rounded-xl shadow-2xl transition-colors duration-300 relative overflow-hidden ${darkMode ? "bg-gray-900 border-transparent bg-clip-padding" : "bg-white border-transparent bg-clip-padding"
                }`}>
                <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 -z-10 opacity-30" />
                <div className={`text-center p-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
                    <p>Connect with your alumni network and start chatting!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col border-2 rounded-xl h-[80vh] shadow-2xl transition-colors duration-300 relative overflow-hidden ${darkMode ? "bg-gray-900 border-transparent bg-clip-padding" : "bg-white border-transparent bg-clip-padding"
            }`}>
            {/* Gradient Border Overlay */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 -z-10" />

            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${darkMode ? "border-white/10" : "border-gray-100"
                }`}>
                <div className="flex items-center gap-3">
                    <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400">
                        <Image
                            src={selectedUser.profilePicture || "/default-profile.jpg"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover bg-white"
                            alt={selectedUser.name}
                        />
                    </div>
                    <div>
                        <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{selectedUser.name}</h3>
                        <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => {
                    const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                    return (
                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative ${isMe
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : (darkMode ? "bg-gray-800 text-white rounded-tl-none border border-white/10" : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200")
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && msg.read && " • Read"}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <button type="button" className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${darkMode ? "text-gray-400 hover:bg-white" : "text-gray-500 hover:bg-gray-200"}`}>
                        <FaSmile size={20} />
                    </button>
                    <div className="flex-1 relative p-[1px] rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-sm focus-within:shadow-md transition-all">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={`w-full rounded-full px-4 py-2 focus:outline-none transition-colors ${darkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-gray-900 placeholder-gray-400"
                                }`}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <FaPaperPlane size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
