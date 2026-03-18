"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function EditGroupModal({ isOpen, onClose, onUpdate, group, onRemoveMember, onDeleteGroup, currentUser }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState(group?.name || "");
    const [description, setDescription] = useState(group?.description || "");
    const [allowFacultyMessaging, setAllowFacultyMessaging] = useState(group?.allowFacultyMessaging ?? true);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(group?.profileImage || "/default-group.jpg");
    const [uploading, setUploading] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");

    const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin" || group?.admin?._id === currentUser?._id;
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setDescription(group.description || "");
            setAllowFacultyMessaging(group.allowFacultyMessaging ?? true);
            setImagePreview(group.profileImage || "/default-group.jpg");
        }
    }, [group]);

    if (!isOpen || !group) return null;

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

        let finalImageUrl = group.profileImage;
        let finalPublicId = group.profileImagePublicId;

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

        onUpdate(group._id, { 
            name, 
            description, 
            allowFacultyMessaging: allowFacultyMessaging,
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId
        });
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border flex flex-col max-h-[95vh] ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Group Settings</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <FaTimes size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center mb-4">
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-28 h-28 rounded-[2.5rem] border-4 border border-blue-500/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden group shadow-xl"
                            >
                                <img src={imagePreview || "/default-group.jpg"} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    accept="image/*"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                    Change Image
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-3 italic opacity-80">Update Group Identity</span>
                        </div>

                        <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-900"}`}>Group Primary Name</label>
                            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30">
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full rounded-[calc(1rem-1px)] px-5 py-4 font-bold text-sm outline-none transition-all ${darkMode ? "bg-gray-950 text-white focus:bg-gray-900" : "bg-white text-gray-900 focus:bg-gray-50"}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-900"}`}>Brief Description</label>
                            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full rounded-[calc(1rem-1px)] px-5 py-4 font-bold text-sm outline-none resize-none h-24 transition-all ${darkMode ? "bg-gray-950 text-white focus:bg-gray-900" : "bg-white text-gray-900 focus:bg-gray-50"}`}
                                />
                            </div>
                        </div>

                        {/* Faculty Messaging Toggle */}
                        <div className="p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
                            <div className={`p-6 rounded-[calc(1.5rem-1px)] flex items-center justify-between transition-all ${darkMode ? "bg-gray-950" : "bg-white"}`}>
                                <div>
                                    <h3 className={`font-black text-sm uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>Faculty Messaging</h3>
                                    <p className="text-[10px] text-gray-500 font-bold">Allow faculty members to send messages in this group</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAllowFacultyMessaging(!allowFacultyMessaging)}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 ${allowFacultyMessaging ? "bg-blue-600" : "bg-gray-400"}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${allowFacultyMessaging ? "right-1" : "left-1"}`} />
                                </button>
                            </div>
                        </div>

                        {/* Remove Members Section */}
                        <div className="space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500 ml-2">Remove Members</h3>
                            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-[calc(1rem-1px)] transition-all ${darkMode ? "bg-gray-950/50" : "bg-white"}`}>
                                    <input 
                                        type="text" 
                                        placeholder="Search members to remove..." 
                                        className={`bg-transparent border-none outline-none w-full text-xs font-bold ${darkMode ? "text-white" : "text-black"}`}
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {group.members?.filter(m => {
                                    const mIsAdmin = m.role === 'admin' || m.isAdmin || String(m._id) === String(group.admin?._id);
                                    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase());
                                    return !mIsAdmin && matchesSearch;
                                }).map(member => (
                                    <div key={member._id} className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                                        <div className={`p-3 rounded-[calc(1rem-1px)] flex items-center justify-between ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="p-[1px] rounded-full bg-gradient-to-tr from-blue-400 to-pink-400">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-gray-800">
                                                        <Image src={member.profilePicture || "/default-profile.jpg"} width={32} height={32} className="object-cover" alt={member.name} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{member.name}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => onRemoveMember(member._id)}
                                                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                                                {/* Delete Group Button (Danger Zone) */}
                         {isAdmin && (
                             <div className="pt-4 border-t dark:border-white/5">
                                 <div className="p-[1px] rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 shadow-lg">
                                    <button 
                                        type="button"
                                        onClick={() => onDeleteGroup(group._id)}
                                        className={`w-full py-4 rounded-[calc(1rem-1px)] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${darkMode ? "bg-gray-950 text-red-500 hover:bg-red-500 hover:text-white" : "bg-white text-red-600 hover:bg-red-600 hover:text-white"}`}
                                    >
                                        Delete Group Permanently
                                    </button>
                                 </div>
                             </div>
                         )}

                        <button
                            type="submit"
                            disabled={uploading || (!name.trim())}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {uploading ? "Updating System..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
