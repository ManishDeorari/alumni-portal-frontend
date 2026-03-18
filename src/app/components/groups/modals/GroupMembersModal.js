"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaSearch, FaUserPlus, FaCheck } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function GroupMembersModal({ 
    isOpen, 
    onClose, 
    members, 
    currentUser, 
    onConnect 
}) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");

    if (!isOpen) return null;

    // Filter members
    const filtered = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.enrollmentNumber && m.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort: Admin -> Faculty -> Alumni
    const sortedMembers = [...filtered].sort((a, b) => {
        const roleOrder = { "admin": 1, "faculty": 2, "alumni": 3 };
        const roleA = a.role || (a.isMainAdmin ? "admin" : "alumni");
        const roleB = b.role || (b.isMainAdmin ? "admin" : "alumni");
        return (roleOrder[roleA] || 4) - (roleOrder[roleB] || 4);
    });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`relative w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col h-[80vh] ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
                
                {/* Header */}
                <div className="p-6 border-b dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className={`text-xl font-black tracking-tighter uppercase ${darkMode ? "text-white" : "text-gray-900"}`}>Group Community</h2>
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{members.length} Total Members</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 pb-0">
                    <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/5">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-[calc(1rem-1px)] transition-all ${darkMode ? "bg-gray-950/50 focus-within:bg-gray-950" : "bg-white focus-within:bg-gray-50"}`}>
                            <FaSearch className="text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search among group members..." 
                                className={`bg-transparent border-none outline-none w-full font-bold text-sm ${darkMode ? "text-white" : "text-black"}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {sortedMembers.map((member) => {
                        const isMe = String(member._id) === String(currentUser?._id);
                        
                        // Check if member is in currentUser's connections array
                        const isConnected = currentUser?.connections?.some(connId => 
                            String(connId) === String(member._id)
                        );
                        
                        const role = member.role || (member.isMainAdmin ? "admin" : "alumni");

                        return (
                            <div key={member._id} className="p-[1px] rounded-[2rem] bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-md transition-all hover:scale-[1.01]">
                                <div className={`p-4 rounded-[calc(2rem-1px)] flex items-center justify-between ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-400 to-pink-500 shadow-lg">
                                            <div className="relative w-14 h-14 rounded-[calc(1rem-2px)] overflow-hidden bg-white dark:bg-gray-800">
                                                <Image 
                                                    src={member.profilePicture || "/default-profile.jpg"} 
                                                    fill 
                                                    className="object-cover" 
                                                    alt={member.name} 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    href={`/dashboard/profile?id=${member._id}`} 
                                                    className={`font-black tracking-tight text-sm hover:text-blue-500 hover:underline transition-all cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`}
                                                >
                                                    {member.name}
                                                </Link>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                    role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                    role === 'faculty' ? 'bg-purple-500/20 text-purple-500' : 
                                                    'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                    {role}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{member.enrollmentNumber || "Alumni"}</p>
                                        </div>
                                    </div>

                                    {!isMe && (
                                        <button 
                                            onClick={() => !isConnected && onConnect(member._id)}
                                            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                isConnected 
                                                    ? "bg-green-500/10 text-green-500 border-2 border-green-500/20 cursor-default" 
                                                    : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                                            }`}
                                        >
                                            {isConnected ? <div className="flex items-center gap-1"><FaCheck /> Connected</div> : <div className="flex items-center gap-1"><FaUserPlus /> Connect</div>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
