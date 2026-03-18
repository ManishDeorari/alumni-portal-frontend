"use client";
import React from "react";
import Image from "next/image";
import { FaTimes, FaUsers, FaImage, FaChevronRight } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function GroupDetailsModal({ 
    isOpen, 
    onClose, 
    group, 
    memberCount, 
    mediaCount,
    onOpenMembers,
    onOpenMedia,
    onViewImage
}) {
    const { darkMode } = useTheme();

    if (!isOpen || !group) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
                
                {/* Header */}
                <div className="p-6 border-b dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black tracking-tighter uppercase">Group Overview</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div 
                            onClick={() => onViewImage(group.profileImage || "/default-group.jpg")}
                            className="p-[2px] rounded-[2.5rem] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-2xl mb-6 scale-110 cursor-zoom-in hover:scale-[1.15] transition-transform"
                        >
                            <div className="relative w-32 h-32 rounded-[calc(2.5rem-2px)] overflow-hidden bg-white dark:bg-gray-800">
                                <Image 
                                    src={group.profileImage || "/default-group.jpg"} 
                                    fill 
                                    className="object-cover" 
                                    alt={group.name} 
                                />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter mb-4">{group.name}</h3>
                        <div className={`px-6 py-4 rounded-3xl border-2 text-sm font-medium leading-relaxed ${darkMode ? "bg-gray-950/50 border-white/5 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
                            {group.description || "In a world of constant communication, this group serves as a dedicated space for collaboration and community."}
                        </div>
                    </div>

                    {/* Quick Access Buttons */}
                    <div className="space-y-4">
                        <button 
                            onClick={onOpenMembers}
                            className={`w-full p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all group hover:scale-[1.02] ${darkMode ? "bg-gray-950/30 border-white/5 hover:border-blue-500/30" : "bg-gray-50 border-gray-100 hover:border-blue-500/30"}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner">
                                    <FaUsers size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase tracking-widest text-blue-500 mb-0.5">Community</p>
                                    <p className="font-bold text-lg">{memberCount} Members</p>
                                </div>
                            </div>
                            <FaChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button 
                            onClick={onOpenMedia}
                            className={`w-full p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all group hover:scale-[1.02] ${darkMode ? "bg-gray-950/30 border-white/5 hover:border-purple-500/30" : "bg-gray-50 border-gray-100 hover:border-purple-500/30"}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner">
                                    <FaImage size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase tracking-widest text-purple-500 mb-0.5">Gallery</p>
                                    <p className="font-bold text-lg">{mediaCount} Shared Files</p>
                                </div>
                            </div>
                            <FaChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Footer Decoration */}
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
            </div>
        </div>
    );
}
