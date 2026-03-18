"use client";
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaCamera } from "react-icons/fa";

export default function CreateGroupModal({ isOpen, onClose, onCreate }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isAllMember, setIsAllMember] = useState(false);
    const [image, setImage] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({ name, description, isAllMemberGroup: isAllMember, profileImage: image });
        setName("");
        setDescription("");
        setIsAllMember(false);
        setImage(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
            <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-800"}`}>Create New Group</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative w-24 h-24 rounded-full bg-blue-500/10 border-2 border-dashed border-blue-500/30 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-all overflow-hidden">
                                <FaCamera size={24} className="text-blue-500" />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 mt-2">Upload Group Picture</span>
                        </div>

                        <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Group Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}
                                placeholder="e.g. Mech Engineering 2018"
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 ${darkMode ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}
                                placeholder="What is this group about?"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <input 
                                type="checkbox" 
                                id="allMember" 
                                checked={isAllMember} 
                                onChange={(e) => setIsAllMember(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="allMember" className={`text-xs font-bold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Automatically include ALL current users
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Create Group
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
