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
        <div className="w-1/3 relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-[calc(100vh-140px)]">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

            <div className={`h-full flex flex-col rounded-[14px] relative overflow-hidden ${darkMode ? "bg-gray-900/95 text-white" : "bg-white/95 text-gray-900"
                }`}>
                <div className="p-4">
                    <h2 className={`text-xl font-black mb-4 tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>Messages</h2>
                    <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm focus-within:shadow-md transition-all">
                        <input
                            type="text"
                            placeholder="Search connections..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className={`w-full rounded-xl px-4 py-2.5 font-bold text-sm placeholder-gray-400 focus:outline-none transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                }`}
                        />
                    </div>
                </div>

                {/* Gradient Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {connections.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10 font-bold text-sm uppercase tracking-widest opacity-60">
                            No connections found.
                        </div>
                    ) : (
                        connections.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => onSelectUser(user)}
                                className={`p-3 flex items-center gap-4 rounded-2xl cursor-pointer transition-all ${selectedUser?._id === user._id
                                    ? (darkMode ? "bg-blue-600/30 ring-1 ring-blue-500/50" : "bg-blue-50 ring-1 ring-blue-200 shadow-sm")
                                    : (darkMode ? "hover:bg-white/5" : "hover:bg-gray-50")
                                    }`}
                            >
                                <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm flex-shrink-0">
                                    <Image
                                        src={user.profilePicture || "/default-profile.jpg"}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover bg-white"
                                        alt={user.name}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{user.name}</h3>
                                    <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                                        {user.headline || "Click to chat"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
