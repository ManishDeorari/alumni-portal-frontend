"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes, FaCamera, FaToggleOn, FaToggleOff, FaUserPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function EditGroupModal({ isOpen, onClose, onUpdate, group }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [allowFaculty, setAllowFaculty] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setDescription(group.description || "");
            setAllowFaculty(!!group.allowFacultyMessaging);
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
            allowFacultyMessaging: allowFaculty,
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId
        });
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-800"}`}>Group Settings</h2>
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
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Group Primary Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full rounded-2xl px-5 py-4 font-bold text-sm border-2 transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Brief Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full rounded-2xl px-5 py-4 font-bold text-sm border-2 transition-all outline-none resize-none h-24 ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500"}`}
                            />
                        </div>

                        <div className={`p-4 rounded-2xl border-2 transition-all group ${allowFaculty ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-gray-500/5 border-gray-300/20 text-gray-500"}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Allow Faculty Messaging</h4>
                                    <p className="text-[9px] opacity-60 font-bold mt-1 leading-tight">If OFF, Faculty can only view messages.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAllowFaculty(!allowFaculty)}
                                    className="text-3xl hover:scale-110 transition-transform"
                                >
                                    {allowFaculty ? <FaToggleOn className="text-blue-500" /> : <FaToggleOff className="text-gray-400" />}
                                </button>
                            </div>
                        </div>

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
