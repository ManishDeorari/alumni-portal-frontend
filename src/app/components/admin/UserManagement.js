"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Mail, UserX, Shield } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function UserManagement({ users, loading, onDelete, onRefresh }) {
    const { darkMode } = useTheme();
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);

    const filteredUsers = users.filter((u) => {
        if (u.isMainAdmin || u.email === "admin@alumniportal.com" || u.email === "manishdeorari377@gmail.com") return false;
        return `${u.name} ${u.email} ${u.enrollmentNumber || ""} ${u.employeeId || ""}`
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Search Header */}
                <div className="p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? "bg-black" : "bg-white"} backdrop-blur-xl p-8 rounded-[calc(2rem-2px)] relative overflow-hidden`}>
                        <div className="relative flex-1 max-w-md p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
                            <div className="relative h-full">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-white text-black"} rounded-2xl outline-none transition-all font-medium`}
                                />
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-blue-400" : "text-gray-400"}`} />
                            </div>
                        </div>
                        <p className={`${darkMode ? "text-blue-300" : "text-blue-600"} text-sm font-black uppercase tracking-widest`}>
                            Total Users: {users.length}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className={`${darkMode ? "text-blue-100/40" : "text-gray-400"} font-black uppercase tracking-widest text-xs`}>Loading members...</p>
                    </div>
                ) : (
                    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all">
                        <div className={`${darkMode ? "bg-black" : "bg-white"} rounded-[calc(1.5rem-1px)] overflow-hidden`}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`${darkMode ? "text-white border-white/10 bg-white/5" : "text-slate-900 border-gray-100 bg-gray-50"} text-[10px] uppercase font-black tracking-[0.2em] border-b`}>
                                            <th className="py-4 px-8 text-left font-black">User Profile</th>
                                            <th className="py-4 px-8 text-left font-black">Role</th>
                                            <th className="py-4 px-8 text-left md:table-cell hidden font-black">Identity</th>
                                            <th className="py-4 px-8 text-right font-black">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${darkMode ? "divide-white/5" : "divide-gray-100"}`}>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id} className={`group ${darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-all`}>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} border ${darkMode ? "border-blue-400/20" : "border-blue-200"} flex items-center justify-center font-black shrink-0`}>
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} truncate`}>{u.name}</p>
                                                            <p className={`text-xs ${darkMode ? "text-blue-300" : "text-slate-600"} truncate`}>{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${u.isAdmin
                                                        ? (darkMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200")
                                                        : (darkMode ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200")
                                                        }`}>
                                                        {u.isAdmin ? "Admin" : u.role}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8 md:table-cell hidden">
                                                    <span className={`text-xs font-black ${darkMode ? "text-white bg-white/10 border-white/10" : "text-slate-900 bg-gray-100 border-gray-300"} px-3 py-1.5 rounded-lg border whitespace-nowrap`}>
                                                        {u.enrollmentNumber || u.employeeId || u.studentId || "Member"}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <button
                                                        onClick={() => setConfirmDelete(u)}
                                                        disabled={u.isMainAdmin || u.email === "manishdeorari377@gmail.com"}
                                                        className={`p-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all active:scale-90 ${(u.isMainAdmin || u.email === "manishdeorari377@gmail.com") ? "opacity-20 cursor-not-allowed" : ""
                                                            }`}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`${darkMode ? "bg-gray-900 border-white/20" : "bg-white border-gray-200"} border rounded-[2rem] p-8 w-full max-w-md shadow-2xl`}
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} text-center mb-2`}>Delete Member?</h3>
                            <p className={`${darkMode ? "text-blue-100/60" : "text-slate-500"} text-center mb-6`}>
                                This will permanently delete <strong>{confirmDelete.name}</strong>&apos;s account. They will receive an email notification.
                            </p>

                            <div className="flex justify-center gap-3 font-black">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className={`px-6 py-3 ${darkMode ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-gray-100 hover:bg-gray-200 text-slate-900 border-gray-200"} rounded-2xl border transition-all flex-1`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await onDelete(confirmDelete._id);
                                        setConfirmDelete(null);
                                        onRefresh();
                                    }}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-xl active:scale-95 transition-all flex-1"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
