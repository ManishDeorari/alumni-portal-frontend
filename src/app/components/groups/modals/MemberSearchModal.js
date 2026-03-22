"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaSearch, FaCheck, FaTimes, FaUsers, FaChevronDown } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import HybridInput from "../../ui/HybridInput";

const COURSE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA"];
const currentYearForDropdown = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => String(2000 + i));

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
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState(initialSelected || []);
    const [isAllAlumniFlag, setIsAllAlumniFlag] = useState(false);
    const [isAllFacultyFlag, setIsAllFacultyFlag] = useState(false);
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

                // 🔴 Role Filtering (Frontend side to ensure accuracy)
                if (roleFilter !== "ALL") {
                    data = data.filter(u => u.role === roleFilter.toLowerCase());
                }

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
    }, [searchTerm, course, year, roleFilter, API_URL]);

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

    const handleSelectRole = (roleKey) => {
        const roleUsers = users.filter(u => (u.role || "alumni").toUpperCase() === roleKey);
        const roleIds = roleUsers.map(u => String(u._id));
        
        // Check if all of THESE role users are already selected
        const allSelected = roleIds.length > 0 && roleIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            // Deselect all for this role
            setSelectedIds(prev => prev.filter(id => !roleIds.includes(id)));
        } else {
            // Select all for this role (merge with current)
            setSelectedIds(prev => [...new Set([...prev, ...roleIds])]);
        }
    };

    const toggleUser = (userId) => {
        const uId = String(userId);
        if (!multiSelect) {
            setSelectedIds([uId]);
            return;
        }
        setSelectedIds(prev =>
            prev.includes(uId)
                ? prev.filter(id => id !== uId)
                : [...prev, uId]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(u => String(u._id)));
        }
    };

    const handleConfirm = () => {
        if (isAllAlumniFlag || isAllFacultyFlag) {
            onSelect({
                userIds: selectedIds,
                isAllAlumni: isAllAlumniFlag,
                isAllFaculty: isAllFacultyFlag
            });
        } else {
            onSelect(multiSelect ? selectedIds : (selectedIds[0] || null));
        }
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

                    {/* Quick Role Select Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAllFacultyFlag(!isAllFacultyFlag);
                                if (!isAllFacultyFlag) setIsAllAlumniFlag(false); // Exclusive for clarity? No, let's allow both
                            }}
                            className={`py-3 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest ${
                                isAllFacultyFlag 
                                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20" 
                                : (darkMode ? "bg-gray-950 border-gray-800 text-gray-500 hover:border-purple-500/50" : "bg-white border-gray-200 text-gray-500 hover:border-purple-500/50")
                            }`}
                        >
                            <span>Add All Faculty</span>
                            {isAllFacultyFlag && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAllAlumniFlag(!isAllAlumniFlag)}
                            className={`py-3 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest ${
                                isAllAlumniFlag 
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                                : (darkMode ? "bg-gray-950 border-gray-800 text-gray-500 hover:border-blue-500/50" : "bg-white border-gray-200 text-gray-500 hover:border-blue-500/50")
                            }`}
                        >
                            <span>Add All Alumni</span>
                            {isAllAlumniFlag && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>
                    </div>

                    {/* Advanced Multi-Filter Search Bar */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {/* Name/General Query */}
                            <div className="col-span-2 p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/5">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-[calc(1rem-1px)] h-full transition-all ${darkMode ? "bg-gray-950 focus-within:bg-gray-900" : "bg-white focus-within:bg-gray-50"}`}>
                                    <FaSearch className="text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, roll..."
                                        className={`bg-transparent border-none outline-none w-full font-bold text-sm ${darkMode ? "text-white" : "text-black"}`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-[calc(1rem-1px)] h-full appearance-none font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
                                >
                                    <option value="ALL">ALL ROLES</option>
                                    <option value="ALUMNI">ALUMNI</option>
                                    <option value="FACULTY">FACULTY</option>
                                </select>
                                <FaChevronDown className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                        </div>

                        {/* Custom Filters (Course, Year) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30">
                                <HybridInput
                                    value={course}
                                    onChange={(val) => setCourse(val)}
                                    options={COURSE_OPTIONS}
                                    placeholder="Course (e.g. B.Tech)"
                                    uppercase={true}
                                    className={`w-full px-4 py-3 rounded-[calc(1rem-1px)] font-black text-[10px] uppercase tracking-widest outline-none transition-all ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
                                />
                            </div>

                            <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
                                <select
                                    value={year}
                                    disabled={!course}
                                    onChange={(e) => setYear(e.target.value)}
                                    className={`w-full px-4 py-[11px] rounded-[calc(1rem-1px)] appearance-none font-black text-[10px] uppercase tracking-widest outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${darkMode ? "bg-gray-950 text-white focus:bg-gray-900" : "bg-white text-gray-900 focus:bg-gray-50"}`}
                                >
                                    <option value="">{course ? "Start Year" : "Select Course First"}</option>
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <FaChevronDown className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 px-1">
                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
                            {users.length} Users Found
                        </span>
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
                        ["FACULTY", "ALUMNI"].map(roleKey => {
                            const groupUsers = users.filter(u => (u.role || "alumni").toUpperCase() === roleKey);
                            if (groupUsers.length === 0) return null;
                            
                            return (
                                <div key={roleKey} className="space-y-3 pt-2">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
                                        <button 
                                            type="button"
                                            onClick={() => handleSelectRole(roleKey)}
                                            className="group flex items-center gap-2 hover:opacity-80 transition-all"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{roleKey}</span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full transition-all ${
                                                groupUsers.every(u => selectedIds.includes(String(u._id)))
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                : "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                                            }`}>
                                                {groupUsers.every(u => selectedIds.includes(String(u._id))) ? "Selected" : "Select All"}
                                            </span>
                                        </button>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
                                    </div>
                                    
                                    {groupUsers.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleUser(user._id)}
                                            className="p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-all hover:scale-[1.01]"
                                        >
                                            <div className={`p-4 flex items-center gap-4 rounded-[calc(1.5rem-1px)] cursor-pointer transition-all border group ${selectedIds.includes(String(user._id))
                                                    ? (darkMode ? "bg-blue-600/20 border-blue-500 shadow-xl" : "bg-blue-50 border-blue-200 shadow-xl")
                                                    : (darkMode ? "bg-gray-900 border-transparent hover:bg-gray-850" : "bg-white border-transparent hover:bg-gray-50")
                                                }`}>
                                                <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-blue-400 to-pink-400">
                                                    <div className="relative w-12 h-12 rounded-[calc(1rem-2px)] overflow-hidden bg-white dark:bg-gray-800">
                                                        <Image 
                                                            src={user.profilePicture || "/default-profile.jpg"} 
                                                            fill 
                                                            className="object-cover" 
                                                            alt={user.name} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`text-sm font-black truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                            user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                            user.role === 'faculty' ? 'bg-purple-500/20 text-purple-500' : 
                                                            'bg-blue-500/20 text-blue-500'
                                                        }`}>
                                                            {user.role || 'alumni'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                                        {user.role === 'faculty' ? user.employeeId : (user.enrollmentNumber || "Alumni")}
                                                    </p>
                                                </div>
                                                {selectedIds.includes(String(user._id)) && (
                                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 animate-in zoom-in duration-300">
                                                        <FaCheck size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })
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
