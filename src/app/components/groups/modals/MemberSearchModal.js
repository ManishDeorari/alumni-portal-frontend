"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaSearch, FaCheck, FaTimes, FaUsers } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function MemberSearchModal({ 
    isOpen, 
    onClose, 
    onSelect, 
    title = "Select Members",
    multiSelect = true,
    initialSelected = []
}) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState(initialSelected || []);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (isOpen) {
            fetchUsers("");
            setSelectedIds(initialSelected);
        }
    }, [isOpen, initialSelected]);

    const fetchUsers = async (term) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/user/all?search=${term}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchUsers(value);
    };

    const toggleUser = (userId) => {
        if (!multiSelect) {
            setSelectedIds([userId]);
            return;
        }
        setSelectedIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(u => u._id));
        }
    };

    const handleConfirm = () => {
        onSelect(multiSelect ? selectedIds : selectedIds[0]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes className="text-gray-500" />
                        </button>
                    </div>

                    {/* Minimal Search Bar */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${darkMode ? "border-gray-800 bg-gray-950/50 focus-within:border-blue-500" : "border-gray-100 bg-gray-50 focus-within:border-blue-500"}`}>
                        <FaSearch className="text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by name or enrollment..."
                            className="bg-transparent border-none outline-none w-full font-bold text-sm"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-4 px-2">
                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
                            {users.length} Users Found
                        </span>
                        {multiSelect && (
                            <button 
                                onClick={handleSelectAll}
                                className="text-[10px] uppercase tracking-widest font-black text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                {selectedIds.length === users.length ? "Deselect All" : "Select All"}
                            </button>
                        )}
                    </div>

                    <div className="mt-4 max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading && users.length === 0 ? (
                            <div className="py-10 text-center animate-pulse text-gray-400 font-bold uppercase text-[10px] tracking-widest">Searching...</div>
                        ) : users.length === 0 ? (
                            <div className="py-10 text-center text-gray-500 font-bold uppercase text-[10px] tracking-widest italic opacity-50">No users found</div>
                        ) : (
                            users.map(user => (
                                <div 
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={`p-3 flex items-center gap-4 rounded-2xl cursor-pointer transition-all border-2 ${
                                        selectedIds.includes(user._id)
                                            ? (darkMode ? "bg-blue-600/20 border-blue-500" : "bg-blue-50 border-blue-200")
                                            : (darkMode ? "border-transparent hover:bg-white/5" : "border-transparent hover:bg-gray-50")
                                    }`}
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                                        {user.profilePicture ? (
                                            <Image src={user.profilePicture} fill className="object-cover" alt={user.name} />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                                <FaUsers className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">@{user.enrollmentNumber || user.role}</p>
                                    </div>
                                    {selectedIds.includes(user._id) && (
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white scale-110 animate-in zoom-in duration-300">
                                            <FaCheck size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button 
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${darkMode ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                                darkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                            }`}
                            style={{ boxShadow: selectedIds.length > 0 ? '0 10px 20px -5px rgba(37, 99, 235, 0.4)' : 'none' }}
                        >
                            Confirm ({selectedIds.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
