"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaCamera, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function EditGroupModal({ isOpen, onClose, onUpdate, group }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [allowFaculty, setAllowFaculty] = useState(false);

    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setDescription(group.description || "");
            setAllowFaculty(!!group.allowFacultyMessaging);
        }
    }, [group]);

    if (!isOpen || !group) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(group._id, { name, description, allowFacultyMessaging: allowFaculty });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
            <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-800"}`}>Edit Group Settings</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Group Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 ${darkMode ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}
                            />
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${allowFaculty ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-gray-300/30 text-gray-400"}`}>
                            <div className="flex-1">
                                <h4 className="text-xs font-black uppercase tracking-widest">Allow Faculty Messaging</h4>
                                <p className="text-[10px] opacity-60 font-bold mt-1">If OFF, Faculty can only view group messages.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setAllowFaculty(!allowFaculty)}
                                className="text-3xl"
                            >
                                {allowFaculty ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Update Group
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
