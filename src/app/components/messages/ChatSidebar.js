"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function ChatSidebar({ connections, selectedUser, onSelectUser, onSearch }) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    return (
        <div className={`w-1/3 border-2 rounded-xl flex flex-col h-[80vh] shadow-2xl transition-colors duration-300 relative overflow-hidden ${darkMode
            ? "bg-gray-900 border-transparent bg-clip-padding"
            : "bg-white border-transparent bg-clip-padding"
            }`}>
            {/* Gradient Border Overlay */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 -z-10" />

            <div className={`p-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Messages</h2>
                <div className="relative p-[1px] rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm focus-within:shadow-md transition-all">
                    <input
                        type="text"
                        placeholder="Search connections..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`w-full rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none transition-colors ${darkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                            }`}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {connections.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        No connections found.
                    </div>
                ) : (
                    connections.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => onSelectUser(user)}
                            className={`p-3 flex items-center gap-3 rounded-lg cursor-pointer transition-all ${selectedUser?._id === user._id
                                ? (darkMode ? "bg-blue-600/30 border border-blue-500/50" : "bg-blue-50 border border-blue-200")
                                : (darkMode ? "hover:bg-white/5" : "hover:bg-gray-50")
                                }`}
                        >
                            <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400">
                                <Image
                                    src={user.profilePicture || "/default-profile.jpg"}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover bg-white"
                                    alt={user.name}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{user.name}</h3>
                                <p className="text-sm text-gray-500 truncate">
                                    {user.headline || "Click to chat"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
