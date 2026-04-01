"use client";
import React from "react";
import Image from "next/image";
import { FaTimes, FaDownload, FaTrash } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function GroupMediaModal({ 
    isOpen, 
    onClose, 
    mediaList, 
    isAdmin, 
    onDelete,
    onViewImage 
}) {
    const { darkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col h-[85vh] ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-[#FAFAFA] border-gray-100 text-gray-900"}`}>
                
                {/* Header */}
                <div className="p-6 border-b dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase">Shared Memories</h2>
                        <p className="text-[10px] font-black uppercase text-purple-500 tracking-widest">{mediaList.length} Images Shared</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#FAFAFA]/5 transition-colors text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {mediaList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 italic">
                            <p className="text-5xl mb-4">📸</p>
                            <p className="font-black text-[10px] uppercase tracking-[0.3em]">No images shared in this group yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mediaList.map((msg) => (
                                <div 
                                    key={msg._id} 
                                    onClick={() => onViewImage(msg.mediaUrl)}
                                    className="p-[1px] rounded-3xl bg-gradient-to-tr from-purple-400 to-pink-500 group relative aspect-square overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                >
                                    <div className="relative w-full h-full rounded-[calc(1.5rem-1px)] overflow-hidden">
                                        <Image 
                                            src={msg.mediaUrl} 
                                            fill 
                                            className="object-cover" 
                                            alt="Shared Group Media" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                            <a 
                                                href={msg.mediaUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                onClick={e => e.stopPropagation()} 
                                                className="p-3 bg-[#FAFAFA] text-black rounded-2xl hover:scale-110 transition-transform shadow-2xl"
                                                title="View Full Size"
                                            >
                                                <FaDownload size={14} />
                                            </a>
                                            {isAdmin && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}
                                                    className="p-3 bg-red-600 text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl"
                                                    title="Delete Image"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
