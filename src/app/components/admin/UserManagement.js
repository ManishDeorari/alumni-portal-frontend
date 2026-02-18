"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Mail, UserX, Shield } from "lucide-react";

export default function UserManagement({ users, loading, onDelete, onRefresh }) {
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-white/20 font-medium"
                        />
                        <Search className="absolute left-4 top-4 w-5 h-5 text-white/20" />
                    </div>
                    <p className="text-blue-100/40 text-sm font-bold uppercase tracking-widest">
                        Total Users: {users.length}
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-100/40 font-black uppercase tracking-widest text-xs">Loading members...</p>
                    </div>
                ) : (
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-blue-100/30 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                        <th className="py-4 px-8 text-left">User Profile</th>
                                        <th className="py-4 px-8 text-left">Role</th>
                                        <th className="py-4 px-8 text-left md:table-cell hidden">Identity</th>
                                        <th className="py-4 px-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="group hover:bg-white/5 transition-all">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300 font-black">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-white">{u.name}</p>
                                                        <p className="text-xs text-blue-100/40">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${u.isAdmin ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                    }`}>
                                                    {u.isAdmin ? "Admin" : u.role}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8 md:table-cell hidden">
                                                <span className="text-xs font-black text-blue-100/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 whitespace-nowrap">
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
                            className="bg-gray-900 border border-white/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white text-center mb-2">Delete Member?</h3>
                            <p className="text-blue-100/60 text-center mb-6">
                                This will permanently delete <strong>{confirmDelete.name}</strong>'s account. They will receive an email notification.
                            </p>

                            <div className="flex justify-center gap-3 font-black">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex-1"
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
