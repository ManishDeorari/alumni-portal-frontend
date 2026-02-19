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
        <div className="w-2/3 p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl h-[80vh]">
            <div className="w-full h-full bg-black rounded-[15px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                    <Image
                        src={selectedUser.profilePicture || "/default-profile.jpg"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border border-white/10"
                        alt={selectedUser.name}
                    />
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedUser.name}</h2>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{selectedUser.headline || "Alumni Portal Member"}</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40 shadow-inner">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 italic">
                            Start a new conversation with {selectedUser.name}
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const senderId = msg?.sender?._id || msg?.sender?.id || msg?.sender;
                            const currentId = currentUser?._id || currentUser?.id;
                            const isMe = senderId === currentId;
                            return (
                                <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[70%] px-4 py-3 rounded-2xl break-words relative shadow-lg ${isMe
                                            ? "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white rounded-br-none border border-white/10"
                                            : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10 backdrop-blur-md"
                                            }`}
                                    >
                                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-2">
                                            <p className={`text-[9px] font-bold ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {isMe && (
                                                <FaCheckDouble
                                                    size={10}
                                                    className={msg.read ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-gray-400/30"}
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
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-[2px] opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
                        <div className="relative flex gap-3 items-center bg-black/40 border border-white/10 rounded-full px-4 py-2">
                            <EmojiPickerToggle
                                onEmojiSelect={handleEmojiSelect}
                                icon={<FaSmile size={22} className="text-gray-400 hover:text-yellow-400 transition-colors" />}
                                iconSize="w-8 h-8 flex items-center justify-center"
                                offset={{ x: 0, y: 12 }}
                                placement="top"
                            />
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type something premium..."
                                className="flex-1 bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none py-2"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-gradient-to-br from-blue-600 to-purple-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale text-white p-3 rounded-full transition-all flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
