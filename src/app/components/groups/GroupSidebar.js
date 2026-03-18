"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";

export default function GroupSidebar({ 
    groups, 
    selectedGroup, 
    onSelectGroup, 
    onSearch, 
    isAdmin,
    onCreateGroup 
}) {
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>Groups</h2>
                        {isAdmin && (
                            <button 
                                onClick={onCreateGroup}
                                className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-110 transition-transform shadow-lg"
                                title="Create Group"
                            >
                                <FaPlus size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm focus-within:shadow-md transition-all">
                        <div className="flex items-center px-3 gap-2">
                             <FaSearch className="text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className={`w-full rounded-xl py-2.5 font-bold text-sm placeholder-gray-400 focus:outline-none transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Gradient Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {groups.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10 font-bold text-sm uppercase tracking-widest opacity-60">
                            No groups found.
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div
                                key={group._id}
                                onClick={() => onSelectGroup(group)}
                                className={`p-3 flex items-center gap-4 rounded-2xl cursor-pointer transition-all ${selectedGroup?._id === group._id
                                    ? (darkMode ? "bg-blue-600/30 ring-1 ring-blue-500/50" : "bg-blue-50 ring-1 ring-blue-200 shadow-sm")
                                    : (darkMode ? "hover:bg-white/5" : "hover:bg-gray-50")
                                    }`}
                            >
                                <div className="relative border-2 rounded-full p-[1px] bg-gradient-to-tr from-blue-400 to-pink-400 shadow-sm flex-shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden bg-gray-100">
                                    {group.profileImage ? (
                                        <Image
                                            src={group.profileImage}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                            alt={group.name}
                                        />
                                    ) : (
                                        <FaUsers size={24} className="text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{group.name}</h3>
                                    <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                                        {group.description || "No description"}
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
