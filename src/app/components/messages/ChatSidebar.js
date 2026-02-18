"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function ChatSidebar({ connections, selectedUser, onSelectUser, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    return (
        <div className="w-1/3 bg-black border border-white/20 rounded-xl flex flex-col h-[80vh] shadow-2xl">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
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
                                ? "bg-blue-600/30 border border-blue-500/50"
                                : "hover:bg-white/5"
                                }`}
                        >
                            <div className="relative">
                                <Image
                                    src={user.profilePicture || "/default-profile.jpg"}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover border border-white/10"
                                    alt={user.name}
                                />
                                {/* Online indicator could go here */}
                                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div> */}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate">{user.name}</h3>
                                <p className="text-sm text-gray-400 truncate">
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
