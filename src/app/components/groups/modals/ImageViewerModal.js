"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaDownload, FaSearchPlus, FaSearchMinus, FaExpandArrowsAlt } from "react-icons/fa";

export default function ImageViewerModal({ isOpen, onClose, imageUrl }) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const imgRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setScale(1);
            setOffset({ x: 0, y: 0 });
        }
    }, [isOpen]);

    if (!isOpen || !imageUrl) return null;

    const handleZoomIn = (e) => {
        e.stopPropagation();
        setScale(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = (e) => {
        e.stopPropagation();
        setScale(prev => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setOffset({ x: 0, y: 0 });
            return next;
        });
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (scale > 1) {
            setIsDragging(true);
            setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && scale > 1) {
            setOffset({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300 overflow-hidden"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="absolute top-6 right-6 flex items-center gap-3 z-[201]" onClick={e => e.stopPropagation()}>
                {scale > 1 && (
                    <button 
                        onClick={handleReset}
                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all animate-in slide-in-from-right-2"
                        title="Reset Zoom"
                    >
                        <FaExpandArrowsAlt size={18} />
                    </button>
                )}
                <button 
                    onClick={handleZoomIn}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                    title="Zoom In"
                >
                    <FaSearchPlus size={18} />
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                    title="Zoom Out"
                >
                    <FaSearchMinus size={18} />
                </button>
                <div className="w-[1px] h-8 bg-white/20 mx-1" />
                <a 
                    href={imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                    title="Download Full Image"
                >
                    <FaDownload size={18} />
                </a>
                <button 
                    onClick={onClose} 
                    className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full transition-all"
                    title="Close"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            <div 
                className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'duration-0' : ''}`}
                style={{ 
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onClick={e => e.stopPropagation()}
                onMouseDown={handleMouseDown}
            >
                <img 
                    ref={imgRef}
                    src={imageUrl} 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl select-none" 
                    alt="Full View" 
                    draggable={false}
                />
            </div>
        </div>
    );
}
