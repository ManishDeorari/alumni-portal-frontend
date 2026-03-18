"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaSearch, FaUserPlus, FaUserCheck } from "react-icons/fa";
import Image from "next/image";

export default function InviteMembersModal({ isOpen, onClose, onInvite, groupId }) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const toggleUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleInvite = () => {
        onInvite(groupId, { userIds: selectedUsers });
        setSelectedUsers([]);
    };

    const handleSelectAll = () => {
         if (selectedUsers.length === filteredUsers.length) {
             setSelectedUsers([]);
         } else {
             setSelectedUsers(filteredUsers.map(u => u._id));
         }
    };

    const filteredUsers = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
            <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border flex flex-col h-[70vh] ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-800"}`}>Invite Members</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm focus-within:shadow-md transition-all mb-4">
                        <div className="flex items-center px-3 gap-2">
                             <FaSearch className="text-gray-400" size={14} />
                             <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full rounded-xl py-2.5 font-bold text-sm focus:outline-none transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            {selectedUsers.length} Selected
                        </span>
                        <button 
                            onClick={handleSelectAll}
                            className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:underline"
                        >
                            {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All Filters"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center text-xs font-bold text-gray-500 mt-10">No users found</div>
                    ) : (
                        filteredUsers.map(user => (
                            <div 
                                key={user._id}
                                onClick={() => toggleUser(user._id)}
                                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${selectedUsers.includes(user._id) ? "bg-blue-500/10 border border-blue-500/50" : "hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"}`}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                                    <Image 
                                        src={user.profilePicture || "/default-profile.jpg"}
                                        width={40}
                                        height={40}
                                        alt={user.name}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{user.name}</h4>
                                    <p className="text-[10px] font-medium text-gray-500 truncate">{user.role} • {user.email}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedUsers.includes(user._id) ? "bg-blue-500 text-white" : "border-2 border-gray-300/30"}`}>
                                    {selectedUsers.includes(user._id) && <FaUserCheck size={10} />}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6">
                    <button
                        disabled={selectedUsers.length === 0}
                        onClick={handleInvite}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        Add Selected Members
                    </button>
                </div>
            </div>
        </div>
    );
}
