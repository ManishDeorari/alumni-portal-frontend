"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    getPendingRequests,
    getSentRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
} from "@/api/connect";
import Link from "next/link";
import Image from "next/image";

const RequestsModal = ({ isOpen, onClose, onActionComplete }) => {
    const [activeTab, setActiveTab] = useState("received"); // 'received' or 'sent'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen, activeTab, fetchRequests]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data =
                activeTab === "received"
                    ? await getPendingRequests()
                    : await getSentRequests();
            setRequests(data || []);
        } catch (err) {
            console.error("Fetch requests error:", err);
        }
    }, [activeTab]);

    const handleAction = async (userId, action) => {
        try {
            if (action === "accept") await acceptConnectionRequest(userId);
            else if (action === "reject") await rejectConnectionRequest(userId);
            else if (action === "cancel") await cancelConnectionRequest(userId);

            // Refresh list
            fetchRequests();
            if (onActionComplete) onActionComplete();
        } catch (err) {
            alert(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-white">Manage Requests</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors text-2xl leading-none">
                        &times;
                    </button>
                </div>

                <div className="flex bg-white/5 p-1 mx-6 mt-6 rounded-xl border border-white/5">
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "received"
                            ? "bg-white text-blue-700 shadow-lg"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        onClick={() => setActiveTab("received")}
                    >
                        Received
                    </button>
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "sent"
                            ? "bg-white text-blue-700 shadow-lg"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        onClick={() => setActiveTab("sent")}
                    >
                        Sent
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white/40 text-sm">Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="p-4 bg-white/5 rounded-full">
                                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="text-white/40 text-sm italic">No {activeTab} requests found</p>
                        </div>
                    ) : (
                        requests.map((user) => (
                            <div key={user._id} className="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={user.profilePicture || "/default-profile.jpg"}
                                        alt={user.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover border border-white/20 bg-gray-800"
                                    />
                                    <div className="min-w-0">
                                        <Link href={`/dashboard/profile/${user._id}`} onClick={onClose}>
                                            <h3 className="font-bold text-white hover:text-blue-300 transition-colors truncate">{user.name}</h3>
                                        </Link>
                                        <p className="text-xs text-white/40 truncate">{user.course || "Alumni"}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {activeTab === "received" ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(user._id, "accept")}
                                                className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-400 transition-all shadow-md shadow-green-500/20"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(user._id, "reject")}
                                                className="px-4 py-1.5 bg-white/10 text-white/60 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(user._id, "cancel")}
                                            className="px-4 py-1.5 bg-white/10 text-white/60 text-xs font-bold rounded-lg hover:bg-white/20 transition-all border border-white/10 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                    <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-medium transition-colors">
                        Close Manager
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestsModal;
