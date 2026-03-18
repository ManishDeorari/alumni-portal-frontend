"use client";
import React from "react";
import { FaTimes, FaDownload } from "react-icons/fa";

export default function ImageViewerModal({ isOpen, onClose, imageUrl }) {
    if (!isOpen || !imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300"
            onClick={onClose}
        >
            <div className="absolute top-6 right-6 flex items-center gap-4 z-[201]">
                <a 
                    href={imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={e => e.stopPropagation()} 
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                    title="Download Full Image"
                >
                    <FaDownload size={20} />
                </a>
                <button 
                    onClick={onClose} 
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <div 
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img 
                    src={imageUrl} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                    alt="Full View" 
                />
            </div>
        </div>
    );
}
