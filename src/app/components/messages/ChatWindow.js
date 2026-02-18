"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { FaPaperPlane, FaSmile, FaCheckDouble } from "react-icons/fa";
import EmojiPickerToggle from "../Post/utils/EmojiPickerToggle";

export default function ChatWindow({ selectedUser, messages, currentUser, onSendMessage, newMessage, setNewMessage }) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage((prev) => prev + emoji.native);
    };

    if (!selectedUser) {
        return (
            <div className="w-2/3 bg-black border border-white/20 rounded-xl flex items-center justify-center h-[80vh] text-gray-300 shadow-2xl">
                <p className="text-lg font-semibold text-white/50">Select a connection to start chatting</p>
            </div>
        );
    }

    return (
        <div className="w-2/3 bg-black border border-white/20 rounded-xl flex flex-col h-[80vh] shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Image
                    src={selectedUser.profilePicture || "/default-profile.jpg"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-white/10"
                    alt={selectedUser.name}
                />
                <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                    <p className="text-xs text-gray-400">{selectedUser.headline || "Alumni Portal Member"}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        Send a message to start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg?.sender?._id === currentUser?._id || msg?.sender === currentUser?._id;
                        return (
                            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl break-words relative ${isMe
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                                        : "bg-white/10 text-gray-200 rounded-bl-none border border-white/10"
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <p className={`text-[10px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {isMe && (
                                            <FaCheckDouble
                                                size={12}
                                                className={msg.read ? "text-blue-400" : "text-gray-300/50"}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20 rounded-b-xl flex gap-3 items-center relative">
                <div className="flex items-center">
                    <EmojiPickerToggle
                        onEmojiSelect={handleEmojiSelect}
                        icon={<FaSmile size={24} className="text-gray-400 hover:text-yellow-400 transition-colors" />}
                        iconSize="w-8 h-8 flex items-center justify-center"
                        offset={{ x: 0, y: 0 }}
                        placement="top"
                    />
                </div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors flex items-center justify-center shadow-lg"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
}
