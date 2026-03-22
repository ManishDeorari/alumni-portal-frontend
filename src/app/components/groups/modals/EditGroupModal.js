"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";
import GroupImageCropperModal from "./GroupImageCropperModal";
import { resizeImage } from "./groupImageUtils";
import GroupAvatar from "../GroupAvatar";

export default function EditGroupModal({ isOpen, onClose, onUpdate, group, onRemoveMember, onDeleteGroup, currentUser }) {
    const { darkMode } = useTheme();
    const [name, setName] = useState(group?.name || "");
    const [description, setDescription] = useState(group?.description || "");
    const [allowFacultyMessaging, setAllowFacultyMessaging] = useState(group?.allowFacultyMessaging ?? true);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageSettings, setProfileImageSettings] = useState(group?.profileImageSettings || { x: 0, y: 0, zoom: 1, width: 100, height: 100 });
    const [imagePreview, setImagePreview] = useState(group?.profileImage || "/default-group.jpg");
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin" || group?.admin?._id === currentUser?._id;
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setDescription(group.description || "");
            setAllowFacultyMessaging(group.allowFacultyMessaging ?? true);
            setImagePreview(group.profileImage || "/default-group.jpg");
            setProfileImageSettings(group.profileImageSettings || { x: 0, y: 0, zoom: 1, width: 100, height: 100 });
        }
    }, [group]);

    if (!isOpen || !group) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                // Resize for faster upload (max 1600px is enough for viewer)
                const resizedFile = await resizeImage(file, 1600);
                setProfileImage(resizedFile);
                setTempImage(URL.createObjectURL(resizedFile));
                setShowCropper(true);
            } catch (err) {
                console.error("Image processing error:", err);
                toast.error("Error processing image");
            } finally {
                setUploading(false);
                e.target.value = null; // reset for same-file re-selection
            }
        }
    };

    const handleCropComplete = (blob, url, settings) => {
        setProfileImageSettings(settings);
        setImagePreview(tempImage);
        setShowCropper(false);
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
                toast.error("Failed to upload image");
            }
        }

        onUpdate(group._id, { 
            name, 
            description, 
            allowFacultyMessaging: allowFacultyMessaging,
            profileImage: finalImageUrl,
            profileImagePublicId: finalPublicId,
            profileImageSettings,
            oldImageUrl: group.profileImage
        });
        setUploading(false);
    };

    const handleDeletePhoto = async () => {
        if (window.confirm("Are you sure you want to remove the group profile photo?")) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/groups/${group._id}/image`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setImagePreview("/default-group.jpg");
                    setProfileImage(null);
                    toast.success("Group photo removed");
                    if (onUpdate) onUpdate(group._id, data.group);
                }
            } catch (err) {
                console.error("Photo deletion error:", err);
                toast.error("Failed to delete group photo");
            }
        }
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
                                <GroupAvatar 
                                    group={{ 
                                        profileImage: imagePreview, 
                                        profileImageSettings, 
                                        name 
                                    }} 
                                    size={112} // 28 * 4, or slightly less than 128 to fit border
                                />
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    accept="image/*"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-black uppercase tracking-widest gap-2">
                                    <span>Change</span>
                                </div>
                            </div>
                            
                            {imagePreview && !imagePreview.includes("default-group.jpg") && (
                                <button
                                    type="button"
                                    onClick={handleDeletePhoto}
                                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                                >
                                    Delete Photo
                                </button>
                            )}
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
                            <div className="flex justify-between items-center px-2">
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">Remove Members</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filter:</span>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className={`bg-transparent outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                                        style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="ALUMNI">ALUMNI</option>
                                        <option value="FACULTY">FACULTY</option>
                                    </select>
                                </div>
                            </div>
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
                                    if (!m) return false;
                                    const mIsAdmin = m.role === 'admin' || m.isAdmin || String(m._id) === String(group.admin?._id);
                                    const matchesSearch = (m.name || "").toLowerCase().includes(memberSearch.toLowerCase());
                                    const matchesRole = roleFilter === "ALL" || (m.role || "alumni").toUpperCase() === roleFilter;
                                    return !mIsAdmin && matchesSearch && matchesRole;
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
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{member.name}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                            member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                            member.role === 'faculty' ? 'bg-purple-500/20 text-purple-500' : 
                                                            'bg-blue-500/20 text-blue-500'
                                                        }`}>
                                                            {member.role || 'alumni'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                                                        {member.role === 'faculty' ? member.employeeId : member.enrollmentNumber}
                                                    </span>
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
            <GroupImageCropperModal 
                isOpen={showCropper}
                imageSrc={tempImage}
                onComplete={handleCropComplete}
                onClose={() => setShowCropper(false)}
            />
        </div>
    );
}
