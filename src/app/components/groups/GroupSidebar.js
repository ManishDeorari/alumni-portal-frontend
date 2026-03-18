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
        <div className="w-full relative p-[2px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-full">
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
                    <div className={`relative px-3 rounded-xl border-2 transition-all ${darkMode ? "bg-gray-800 border-gray-700 focus-within:border-blue-500" : "bg-gray-50 border-gray-100 focus-within:border-blue-500"}`}>
                        <div className="flex items-center gap-2">
                             <FaSearch className="text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full bg-transparent py-2.5 font-bold text-sm placeholder-gray-400 focus:outline-none"
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
                                    <Image
                                        src={group.profileImage || "/default-group.jpg"}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover"
                                        alt={group.name}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`p-[1px] rounded-lg transition-all ${selectedGroup?._id === group._id 
                                        ? "bg-gradient-to-r from-blue-400 to-pink-500 scale-[1.02] shadow-lg shadow-blue-500/10" 
                                        : (darkMode ? "bg-white/10" : "bg-gray-200")}`}>
                                        <div className={`p-2 rounded-[7px] ${selectedGroup?._id === group._id 
                                            ? (darkMode ? "bg-gray-900" : "bg-white") 
                                            : (darkMode ? "bg-gray-900/50" : "bg-white/50")}`}>
                                            <h3 className={`font-black truncate text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{group.name}</h3>
                                            <p className="text-[9px] font-bold text-gray-500 truncate uppercase mt-0.5">
                                                {group.description || "Active Group"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
