"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Mail, UserX, Shield, Check, Minus, X, AlertTriangle, Filter, Send } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import HybridInput from "../ui/HybridInput";
import EmojiPickerToggle from "../Post/utils/EmojiPickerToggle";
import { toast } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const COURSE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA"];
const currentYearForDropdown = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => String(2000 + i));

export default function UserManagement({ users, loading, onDelete, onBulkDelete, onRefresh }) {
    const { darkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        course: "",
        year: "",
    });
    const [displayedUsers, setDisplayedUsers] = useState(users);
    const [isSearching, setIsSearching] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'single' | 'bulk', data: user | ids[] }
    const [messageModal, setMessageModal] = useState(null); // { userIds: [], names: "" }
    const [messageText, setMessageText] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Sync displayedUsers with users prop whenever prop changes (for initials or updates)
    useEffect(() => {
        const filtered = (users || []).filter(u => !(u.isMainAdmin || u.email === "manishdeorari377@gmail.com"));
        setDisplayedUsers(filtered);
    }, [users]);

    const handleSearch = () => {
        setIsSearching(true);
        // Simulate a small delay for "Export Search" feel
        setTimeout(() => {
            const results = (users || []).filter((u) => {
                // Exclusion check for Main Admin
                if (u.isMainAdmin || u.email === "manishdeorari377@gmail.com") return false;

                // 1. Text Search (Name, Email, Enrollment, StudentID, EmployeeID, Role)
                const searchStr = `${u.name || ""} ${u.email || ""} ${u.enrollmentNumber || ""} ${u.studentId || ""} ${u.employeeId || ""} ${u.role || ""}`.toLowerCase();
                const textMatch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());

                // 2. Course Filter (Check root AND education history for parity with Export API)
                const uCourse = (u.course || u.department || "").toLowerCase();
                const eduCourses = (u.education || []).map(e => (e.course || e.degree || e.fieldOfStudy || "").toLowerCase());
                const targetCourse = filters.course.toLowerCase();
                const courseMatch = !filters.course || 
                    uCourse.includes(targetCourse) || 
                    eduCourses.some(ec => ec.includes(targetCourse));

                // 3. Year Filter (Check root AND education history end years)
                const uYear = String(u.year || u.graduationYear || u.batch || "");
                const eduYears = (u.education || []).map(e => String(e.endYear || e.year || ""));
                const yearMatch = !filters.year || 
                    uYear === filters.year || 
                    eduYears.includes(filters.year);

                return textMatch && courseMatch && yearMatch;
            });
            setDisplayedUsers(results);
            setIsSearching(false);
        }, 300);
    };

    const isAllSelected = displayedUsers.length > 0 && displayedUsers.every(u => selectedUsers.includes(u._id));
    const isIndeterminate = selectedUsers.length > 0 && !isAllSelected && displayedUsers.some(u => selectedUsers.includes(u._id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            const visibleIds = displayedUsers.map(u => u._id);
            setSelectedUsers(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            const visibleIds = displayedUsers.map(u => u._id);
            setSelectedUsers(prev => [...new Set([...prev, ...visibleIds])]);
        }
    };

    const toggleSelect = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleDeleteClick = (user) => {
        setConfirmDelete({ type: "single", data: user });
    };

    const handleBulkDeleteClick = () => {
        if (selectedUsers.length === 0) return;
        setConfirmDelete({ type: "bulk", data: selectedUsers });
    };

    const executeDelete = async () => {
        if (!confirmDelete) return;

        if (confirmDelete.type === "single") {
            await onDelete(confirmDelete.data._id);
            setSelectedUsers(prev => prev.filter(id => id !== confirmDelete.data._id));
        } else {
            await onBulkDelete(confirmDelete.data);
            setSelectedUsers([]);
        }
        setConfirmDelete(null);
        onRefresh();
    };

    // --- Messaging Logic ---
    const handleMessageClick = (user) => {
        setMessageModal({ userIds: [user._id], names: user.name });
        setMessageText("");
    };

    const handleBulkMessageClick = () => {
        if (selectedUsers.length === 0) return;
        const selectedNames = users
            .filter(u => selectedUsers.includes(u._id))
            .map(u => u.name)
            .join(", ");
        
        const displayName = selectedNames.length > 30 ? `${selectedUsers.length} selected users` : selectedNames;
        
        setMessageModal({ userIds: selectedUsers, names: displayName });
        setMessageText("");
    };

    const sendNotice = async () => {
        if (!messageText.trim() || !messageModal) return;
        setIsSendingMessage(true);
        try {
            const res = await fetch(`${API}/api/admin/send-notice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    userIds: messageModal.userIds,
                    message: messageText
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send notice");
            
            toast.success(`Notice sent successfully!`);
            setMessageModal(null);
            setMessageText("");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Could not send notice");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessageText(prev => prev + emoji.native);
    };

    return (
        <div className="space-y-6 relative pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Advanced Search Header (Copied from Export Section) */}
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-8 rounded-[calc(1.5rem-1px)] space-y-8`}>
                        {/* Status Bar Section (As Requested: Counters) */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5 font-black uppercase tracking-widest">
                            <div className="flex items-center gap-6">
                                <div className="text-left">
                                    <p className={`${darkMode ? "text-blue-300" : "text-blue-600"} text-[10px]`}>Total Members</p>
                                    <p className={`text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>{users.length}</p>
                                </div>
                                <div className={`w-[2px] h-12 ${darkMode ? "bg-white/10" : "bg-gray-200"}`}></div>
                                <div className="text-left">
                                    <p className={`${darkMode ? "text-purple-400" : "text-purple-600"} text-[10px]`}>In Current View</p>
                                    <p className={`text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>{displayedUsers.length}</p>
                                </div>
                            </div>
                            
                            {selectedUsers.length > 0 && (
                                <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-400/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <p className="text-xs text-blue-400">
                                        {selectedUsers.length} Selected Globally
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Search Bar Grid */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
                                <div className="relative h-full">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, role, enrolment..."
                                        value={searchQuery}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white placeholder-white/30" : "bg-[#FAFAFA] text-black border border-gray-100"} rounded-2xl outline-none transition-all font-medium`}
                                    />
                                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-blue-400" : "text-gray-400"}`} />
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-10 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_25px_rgba(37,99,235,0.4)] active:scale-95 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Search className="w-5 h-5" />
                                Search Users
                            </button>
                        </div>

                        {/* Filter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 z-[60]">
                                <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white/50" : "text-slate-500"} ml-2 font-black`}>Course</label>
                                <div className="p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl relative">
                                    <HybridInput
                                        value={filters.course}
                                        onChange={(val) => setFilters({ ...filters, course: val })}
                                        options={COURSE_OPTIONS}
                                        placeholder="All Courses"
                                        uppercase={true}
                                        placement="top"
                                        className={`w-full px-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-[#FAFAFA] text-black border border-gray-200"} rounded-xl text-[10px] uppercase tracking-widest outline-none font-bold italic`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white/50" : "text-slate-500"} ml-2 font-black`}>Batch / Graduation Year</label>
                                <div className="p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl relative">
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        className={`w-full px-4 py-[15px] ${darkMode ? "bg-black text-white" : "bg-[#FAFAFA] text-black border border-gray-100"} rounded-xl text-[10px] uppercase tracking-widest outline-none font-bold appearance-none cursor-pointer`}
                                    >
                                        <option value="">All Years</option>
                                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <svg className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-blue-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {loading || isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
                        <p className={`${darkMode ? "text-blue-100/40" : "text-gray-400"} font-black uppercase tracking-widest text-xs animate-pulse`}>
                            {isSearching ? "Searching Member Database..." : "Loading all members..."}
                        </p>
                    </div>
                ) : (
                    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all">
                        <div className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1.5rem-1px)] overflow-hidden`}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`${darkMode ? "text-white border-white/10 bg-[#FAFAFA]/5" : "text-slate-900 border-gray-100 bg-gray-50"} text-[10px] uppercase font-black tracking-[0.2em] border-b`}>
                                            <th className="py-4 px-6 text-left w-12">
                                                <div 
                                                    onClick={handleSelectAll}
                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                        isAllSelected 
                                                            ? "bg-blue-500 border-blue-500" 
                                                            : isIndeterminate 
                                                                ? "bg-blue-500/50 border-blue-500" 
                                                                : `${darkMode ? "border-white/20 hover:border-white/40" : "border-gray-300 hover:border-gray-400"}`
                                                    }`}
                                                >
                                                    {isAllSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                                    {isIndeterminate && <Minus className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                                </div>
                                            </th>
                                            <th className="py-4 px-4 text-left font-black">User Profile</th>
                                            <th className="py-4 px-8 text-left font-black">Role</th>
                                            <th className="py-4 px-8 text-left md:table-cell hidden font-black">Identity</th>
                                            <th className="py-4 px-8 text-right font-black">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${darkMode ? "divide-white/5" : "divide-gray-100"}`}>
                                        {displayedUsers.map((u) => {
                                            const isSelected = selectedUsers.includes(u._id);
                                            return (
                                                <tr 
                                                    key={u._id} 
                                                    onClick={() => toggleSelect(u._id)}
                                                    className={`group ${darkMode ? "hover:bg-[#FAFAFA]/5" : "hover:bg-gray-50"} ${isSelected ? (darkMode ? "bg-blue-500/10" : "bg-blue-50") : ""} transition-all cursor-pointer`}
                                                >
                                                    <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                                                        <div 
                                                            onClick={() => toggleSelect(u._id)}
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? "bg-blue-500 border-blue-500" 
                                                                    : `${darkMode ? "border-white/20 group-hover:border-white/40" : "border-gray-300 group-hover:border-gray-400"}`
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative shrink-0">
                                                                {u.profilePicture ? (
                                                                    <img 
                                                                        src={u.profilePicture} 
                                                                        alt={u.name} 
                                                                        className={`w-10 h-10 rounded-full object-cover border ${darkMode ? "border-white/10" : "border-gray-200"}`}
                                                                    />
                                                                ) : (
                                                                    <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} border ${darkMode ? "border-blue-400/20" : "border-blue-200"} flex items-center justify-center font-black text-xs`}>
                                                                        {u.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                {isSelected && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                                                                        <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} truncate text-sm`}>{u.name}</p>
                                                                <p className={`text-[10px] ${darkMode ? "text-blue-300" : "text-slate-600"} truncate`}>{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-8">
                                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${u.isAdmin
                                                            ? (darkMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200")
                                                            : (darkMode ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200")
                                                            }`}>
                                                            {u.role || (u.isAdmin ? 'Admin' : 'Member')}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-8 md:table-cell hidden">
                                                        <span className={`text-[10px] font-black ${darkMode ? "text-white bg-[#FAFAFA]/10 border-white/10" : "text-slate-900 bg-gray-100 border-gray-300"} px-3 py-1.5 rounded-lg border whitespace-nowrap`}>
                                                            {u.enrollmentNumber || u.employeeId || u.studentId || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleMessageClick(u)}
                                                                className={`p-2.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-xl transition-all active:scale-90`}
                                                                title="Message User"
                                                            >
                                                                <Mail className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(u)}
                                                                disabled={u.isMainAdmin || u.email === "manishdeorari377@gmail.com"}
                                                                className={`p-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all active:scale-90 ${(u.isMainAdmin || u.email === "manishdeorari377@gmail.com") ? "opacity-20 cursor-not-allowed" : ""
                                                                    }`}
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {displayedUsers.length === 0 && (
                                    <div className="py-20 text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? "bg-white/5" : "bg-gray-100"}`}>
                                            <Search className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-xs opacity-40">No matching users found in member database</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Sticky Action Bar */}
            <AnimatePresence>
                {selectedUsers.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] w-[calc(100%-2rem)] max-w-2xl px-4"
                    >
                        <div className={`p-1 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-[0_20px_50px_rgba(0,0,0,0.3)]`}>
                            <div className={`${darkMode ? "bg-black" : "bg-white"} rounded-[calc(1.5rem+3px)] px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-xl`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
                                        {selectedUsers.length}
                                    </div>
                                    <div>
                                        <p className={`font-black text-xs uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}>Users Selected</p>
                                        <button 
                                            onClick={() => setSelectedUsers([])}
                                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-all uppercase tracking-tighter"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleBulkMessageClick}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Message
                                    </button>
                                    <button
                                        onClick={handleBulkDeleteClick}
                                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setSelectedUsers([])}
                                        className={`p-2.5 rounded-2xl border ${darkMode ? "border-white/10 hover:bg-white/5 text-white/40 hover:text-white" : "border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-900"} transition-all`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Modal */}
            <AnimatePresence>
                {messageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative p-[2px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
                    >
                        <div className={`relative ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(2.5rem-2px)] p-8 h-full w-full overflow-hidden`}>
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                        <Mail className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} leading-none`}>Send Notice</h3>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                            To: {messageModal.names}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setMessageModal(null)}
                                    className={`p-3 rounded-full hover:bg-gray-100/10 transition-all ${darkMode ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className={`relative p-[2px] rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-md`}>
                                    <div className={`rounded-[calc(1rem-2px)] overflow-hidden ${darkMode ? "bg-black" : "bg-white"}`}>
                                        <textarea
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type your official administrative notice here..."
                                            className={`w-full h-40 p-6 rounded-2xl outline-none resize-none bg-transparent ${darkMode ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"} font-bold text-sm leading-relaxed`}
                                        />
                                        <div className="absolute bottom-6 right-6 flex items-center gap-4">
                                            <span className={`text-[10px] font-black tracking-widest ${darkMode ? "text-white/20" : "text-gray-400"}`}>
                                                {messageText.length} Characters
                                            </span>
                                            <EmojiPickerToggle 
                                                onEmojiSelect={handleEmojiSelect}
                                                darkMode={darkMode}
                                                iconSize="text-2xl"
                                                placement="top"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-2">
                                    <button
                                        onClick={sendNotice}
                                        disabled={isSendingMessage || !messageText.trim()}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all ${
                                            !messageText.trim()
                                            ? `${darkMode ? "bg-white/5 text-white/20" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                                            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95"
                                        }`}
                                    >
                                        {isSendingMessage ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Announcement Notice
                                            </>
                                        )}
                                    </button>
                                    <p className={`text-[9px] text-center font-black uppercase tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        Notice will be delivered to the system notification center
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`${darkMode ? "bg-slate-900 border-white/10" : "bg-[#FAFAFA] border-gray-200"} border rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden`}
                        >
                            {/* Decorative background alert icon */}
                            <div className="absolute -top-10 -right-10 opacity-5 rotate-12 scale-150">
                                <AlertTriangle className="w-40 h-40 text-red-500" />
                            </div>

                            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 animate-bounce">
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                            
                            <h3 className={`text-2xl md:text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"} text-center mb-2 leading-tight`}>
                                {confirmDelete.type === "bulk" ? `Delete ${confirmDelete.data.length} Users?` : "Delete Member?"}
                            </h3>
                            
                            <div className={`p-4 rounded-2xl mb-6 ${darkMode ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-100"} border`}>
                                <p className={`text-sm md:text-base font-medium ${darkMode ? "text-red-300" : "text-red-600"} text-center`}>
                                    {confirmDelete.type === "bulk" 
                                        ? "This will permanently remove selected accounts and all their associated data including posts, media, and connections."
                                        : `This will permanently delete ${confirmDelete.data.name}'s account and all associated data.`}
                                </p>
                                <p className={`text-[10px] font-black uppercase tracking-[0.1em] text-center mt-3 ${darkMode ? "text-red-400/50" : "text-red-500/50"}`}>
                                    ⚠️ THIS ACTION CANNOT BE UNDONE
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 font-black">
                                <button
                                    onClick={executeDelete}
                                    className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                                >
                                    Confirm Permanent Deletion
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className={`px-6 py-4 ${darkMode ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-gray-100 hover:bg-gray-200 text-slate-900 border-gray-200"} rounded-2xl border transition-all text-sm uppercase tracking-widest`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
