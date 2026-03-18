"use client";
import React, { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaCamera, FaUsers, FaPlus } from "react-icons/fa";
import MemberSearchModal from "./MemberSearchModal";
import { toast } from "react-hot-toast";

export default function CreateGroupModal({ isOpen, onClose, onCreate }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isAllMember, setIsAllMember] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let finalImageUrl = "/default-group.jpg";
        let finalPublicId = null;

        if (profileImage) {
            try {
                const formData = new FormData();
                formData.append("file", profileImage);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                
                const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                if (data.secure_url) {
                    finalImageUrl = data.secure_url;
                    finalPublicId = data.public_id;
                }
            } catch (err) {
                console.error("Upload error:", err);
                toast.error("Failed to upload group image");
            }
        }

        onCreate({ 
            name, 
            description, 
            isAllMemberGroup: isAllMember, 
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId,
            members: selectedMemberIds 
        });

        // Reset
        setName("");
        setDescription("");
        setIsAllMember(false);
        setProfileImage(null);
        setImagePreview(null);
        setSelectedMemberIds([]);
        setUploading(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col max-h-[95vh] ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-800"}`}>Create Group</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <FaTimes size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center mb-4">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative w-28 h-28 rounded-[2.5rem] bg-blue-500/10 border-4 border-dashed border-blue-500/30 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-all overflow-hidden group shadow-xl"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                                    ) : (
                                        <FaCamera size={32} className="text-blue-500 animate-pulse" />
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase font-black tracking-widest">
                                        Change
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-3 italic opacity-80 underline underline-offset-4 decoration-blue-500/50">Group Identity Picture</span>
                            </div>

                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Group Primary Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full rounded-2xl px-5 py-4 font-bold text-sm border-2 transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                                    placeholder="Mech Engineering 2024..."
                                />
                            </div>

                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Brief Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full rounded-2xl px-5 py-4 font-bold text-sm border-2 transition-all outline-none resize-none h-24 ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                                    placeholder="Describe the purpose of this alumni circle..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className={`block text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Group Membership</label>
                                
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isAllMember ? "bg-blue-500/10 border-blue-500/30" : (darkMode ? "bg-gray-950/50 border-gray-800" : "bg-gray-50 border-gray-100")}`}>
                                    <input 
                                        type="checkbox" 
                                        id="allMember" 
                                        checked={isAllMember} 
                                        onChange={(e) => setIsAllMember(e.target.checked)}
                                        className="w-6 h-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    />
                                    <label htmlFor="allMember" className={`text-xs font-black cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                        INCLUDE ALL ALUMNI AUTOMATICALLY
                                    </label>
                                </div>

                                {!isAllMember && (
                                    <button
                                        type="button"
                                        onClick={() => setShowMemberSearch(true)}
                                        className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all ${darkMode ? "bg-gray-950/50 border-gray-800 hover:border-blue-500/50 text-gray-400" : "bg-gray-50 border-gray-200 hover:border-blue-500/50 text-gray-500"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaPlus size={12} className="text-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Select Individual Members</span>
                                        </div>
                                        {selectedMemberIds.length > 0 && (
                                            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-500/30 animate-in zoom-in">
                                                {selectedMemberIds.length} Selected
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || (!name.trim())}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                            >
                                {uploading ? "Configuring Group..." : "Initialize Group"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <MemberSearchModal 
                isOpen={showMemberSearch}
                onClose={() => setShowMemberSearch(false)}
                onSelect={(ids) => setSelectedMemberIds(ids)}
                initialSelected={selectedMemberIds}
                title="Add Initial Members"
            />
        </>
    );
}
