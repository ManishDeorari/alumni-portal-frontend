"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaSearch, FaCheck, FaTimes, FaUsers, FaChevronDown } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function MemberSearchModal({
    isOpen,
    onClose,
    onSelect,
    title = "Select Members",
    multiSelect = true,
    initialSelected = [],
    excludeIds = []
}) {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [course, setCourse] = useState("");
    const [year, setYear] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState(initialSelected || []);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Use connect/search to get the same filtering power as Network page
            let url = `${API_URL}/api/connect/search?query=${searchTerm}`;
            if (course) url += `&course=${course}`;
            if (course && year) url += `&year=${year}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                let data = await res.json();

                // 🛑 Exclude Admins and Main Admins from invitation list as requested
                data = data.filter(u =>
                    u.role !== 'admin' &&
                    !u.isAdmin &&
                    !u.isMainAdmin
                );

                // 🛑 Exclude existing members if provided
                if (excludeIds && excludeIds.length > 0) {
                    const excludeSet = new Set(excludeIds.map(String));
                    data = data.filter(u => !excludeSet.has(String(u._id)));
                }

                setUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, course, year, API_URL]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, fetchUsers]);

    // Update selected IDs when initialSelected changes
    useEffect(() => {
        if (isOpen && initialSelected && initialSelected.length > 0) {
            setSelectedIds(prev => {
                const isSame = JSON.stringify(prev.map(String).sort()) === JSON.stringify([...initialSelected].map(String).sort());
                return isSame ? prev : initialSelected;
            });
        }
    }, [isOpen, initialSelected]); 

    // Clear year if course is cleared
    useEffect(() => {
        if (!course) setYear("");
    }, [course]);

    const toggleUser = (userId) => {
        const uId = String(userId);
        if (!multiSelect) {
            setSelectedIds([uId]);
            return;
        }
        setSelectedIds(prev =>
            prev.map(String).includes(uId)
                ? prev.filter(id => String(id) !== uId)
                : [...prev, uId]
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
            {/* Height reduced by 20% -> h-[75vh] instead of full or larger h */}
            <div className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col max-h-[95vh] ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"}`}>

                {/* Header */}
                <div className="p-6 border-b dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes className="text-gray-500" />
                        </button>
                    </div>

                    {/* Advanced Multi-Filter Search Bar */}
                    <div className="space-y-4">
                        {/* Name/General Query */}
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${darkMode ? "border-gray-800 bg-gray-950/50 focus-within:border-blue-500" : "border-gray-100 bg-gray-50 focus-within:border-blue-500"}`}>
                            <FaSearch className="text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name, roll number, or course..."
                                className="bg-transparent border-none outline-none w-full font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Custom Filters (Course, Year) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Course (e.g. B.Tech)"
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest outline-none transition-all ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                                />
                            </div>

                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder={course ? "Start Year (e.g. 2024)" : "Select Course First"}
                                    value={year}
                                    disabled={!course}
                                    onChange={(e) => setYear(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 px-1">
                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
                            {users.length} Users Found
                        </span>
                        {multiSelect && (
                            <button
                                onClick={handleSelectAll}
                                className="text-[10px] uppercase tracking-widest font-black text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                {selectedIds.length === users.length && users.length > 0 ? "Deselect All" : "Select All"}
                            </button>
                        )}
                    </div>
                </div>

                {/* User List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-2 custom-scrollbar">
                    {loading && users.length === 0 ? (
                        <div className="py-10 text-center animate-pulse text-gray-400 font-bold uppercase text-[10px] tracking-widest flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Filtering Alumnis...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 font-bold uppercase text-[10px] tracking-widest italic opacity-50 flex flex-col items-center gap-4">
                            <FaUsers size={40} className="opacity-20" />
                            <span>No members match your filters</span>
                        </div>
                    ) : (
                        users.map(user => (
                            <div
                                key={user._id}
                                onClick={() => toggleUser(user._id)}
                                className={`p-4 flex items-center gap-4 rounded-3xl cursor-pointer transition-all border-2 group ${selectedIds.includes(user._id)
                                        ? (darkMode ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10" : "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5")
                                        : (darkMode ? "border-transparent hover:bg-white/5" : "border-transparent hover:bg-gray-50")
                                    }`}
                            >
                                <div className="relative w-12 h-12 rounded-[1rem] overflow-hidden border-2 border-white/20 transition-transform group-hover:scale-110">
                                    <Image 
                                        src={user.profilePicture || "/default-profile.jpg"} 
                                        fill 
                                        className="object-cover" 
                                        alt={user.name} 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-black truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                        {user.course} • {user.year} • {user.enrollmentNumber || "N/A"}
                                    </p>
                                </div>
                                {selectedIds.includes(user._id) && (
                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 animate-in zoom-in duration-300">
                                        <FaCheck size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t dark:border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${darkMode ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${darkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                            }`}
                        style={{ boxShadow: selectedIds.length > 0 ? '0 10px 30px -5px rgba(37, 99, 235, 0.4)' : 'none' }}
                    >
                        Initialize ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
