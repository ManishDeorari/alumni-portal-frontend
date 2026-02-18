
import React, { useState, useEffect } from "react";
import { Copy, Edit, UserPlus, Check } from "lucide-react";
import toast from "react-hot-toast";
import ProfileAvatar from "./ProfileAvatar";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import EditBasicInfoModal from "./modals/EditBasicInfoModal";

export default function ProfileBasicInfo({ profile, setProfile, onRefresh, isPublicView }) {
    const [copied, setCopied] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // null, 'connected', 'pending', 'none'
    const [loading, setLoading] = useState(false);

    const copyToClipboard = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile((prev) => ({
            ...prev,
            ...updatedProfile,
        }));
    };

    // Fetch connection status when viewing another user's profile
    useEffect(() => {
        if (isPublicView && profile._id) {
            fetchConnectionStatus();
        }
    }, [isPublicView, profile._id, fetchConnectionStatus]);

    const fetchConnectionStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const currentUserRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const currentUser = await currentUserRes.json();

            // Check if already connected
            const connections = currentUser.connections || [];
            if (connections.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('connected');
                return;
            }

            // Check if request already sent
            const sentRequests = currentUser.sentRequests || [];
            if (sentRequests.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('pending');
                return;
            }

            // Check if they sent you a request
            const pendingRequests = currentUser.pendingRequests || [];
            if (pendingRequests.some(id => id.toString() === profile._id.toString())) {
                setConnectionStatus('accept');
                return;
            }

            setConnectionStatus('none');
        } catch (err) {
            console.error("Error fetching connection status:", err);
        }
    }, [isPublicView, profile._id]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ to: profile._id }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Connection request sent!");
                setConnectionStatus('pending');
            } else {
                toast.error(data.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Error sending connection request:", err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-3 rounded-xl overflow-hidden bg-white shadow-md text-gray-900">
            {/* 🔷 Banner */}
            <div className="relative w-full h-36">
                <ProfileBanner
                    image={profile.bannerImage}
                    onUpload={onRefresh}
                    userId={profile._id}
                    isPublicView={isPublicView}
                />
            </div>

            {/* 🔷 Profile Info Block */}
            <div className="relative px-6 pb-6 -mt-12 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative flex justify-center">
                    <ProfileAvatar
                        image={profile.profilePicture}
                        onUpload={onRefresh}
                        userId={profile._id}
                        isPublicView={isPublicView}
                    />
                </div>

                {/* Name + Edit */}
                <div className="flex justify-center w-full mt-4 relative">
                    <h2 className="text-2xl font-bold">{profile.name || "Unnamed User"}</h2>
                    {!isPublicView && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="absolute right-4 top-1 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition"
                            title="Edit Contact Info"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Email & Enrollment & Socials */}
                <div className="w-full max-w-md text-center mt-3 space-y-2">
                    {/* Email */}
                    <div className="flex justify-center items-center gap-2 text-sm text-gray-700">
                        <strong>Email:</strong> {profile.email}
                        {profile.email && (
                            <button
                                onClick={() => copyToClipboard(profile.email, "email")}
                                className="text-gray-500 hover:text-blue-600 focus:outline-none"
                                title="Copy Email"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        )}
                        {copied === "email" && <span className="text-green-500 ml-1 text-xs">Copied</span>}
                    </div>

                    {/* ID Field (Enrollment or Employee ID) */}
                    <div className="text-sm text-gray-700">
                        <strong>
                            {profile.role === 'admin' || profile.role === 'faculty' ? 'Employee ID:' : 'Enrollment No:'}
                        </strong> {profile.role === 'admin' || profile.role === 'faculty' ? (profile.employeeId || "N/A") : (profile.enrollmentNumber || "N/A")}
                    </div>

                    {/* Contact Details */}
                    <div className="text-sm text-gray-700 space-y-2 pt-2 border-t border-gray-100 mt-2">

                        {/* Phone */}
                        <div className="flex justify-center items-center gap-2">
                            <strong>Phone:</strong> {profile.phone || "Not provided"}
                            {profile.phone && (
                                <button
                                    onClick={() => copyToClipboard(profile.phone, "phone")}
                                    className="text-gray-500 hover:text-blue-600 focus:outline-none"
                                    title="Copy Phone"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            )}
                            {copied === "phone" && <span className="text-green-500 ml-1 text-xs">Copied</span>}
                        </div>

                        {/* Address */}
                        <p><strong>Address:</strong> {profile.address || "Not set"}</p>

                        {/* WhatsApp */}
                        <p>
                            <strong>WhatsApp:</strong>{" "}
                            {profile.whatsapp ? (
                                <a
                                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {profile.whatsapp}
                                </a>
                            ) : (
                                "Not linked"
                            )}
                        </p>

                        {/* LinkedIn */}
                        <p>
                            <strong>LinkedIn:</strong>{" "}
                            {profile.linkedin ? (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    View Profile
                                </a>
                            ) : (
                                "Not linked"
                            )}
                        </p>
                    </div>
                </div>

                {/* 🔷 Stats Section */}
                <ProfileStats profile={profile} isPublicView={isPublicView} />
            </div>

            {/* Edit Modal */}
            <EditBasicInfoModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentProfile={profile}
                onSave={handleProfileUpdate}
            />
        </div>
    );
}
