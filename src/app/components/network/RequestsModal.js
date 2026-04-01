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
import { useTheme } from "@/context/ThemeContext";

const RequestsModal = ({ isOpen, onClose, onActionComplete }) => {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState("received"); // 'received' or 'sent'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

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
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen, activeTab, fetchRequests]);

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
            <div className={`relative p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]`}>
                <div className={`flex flex-col h-full rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'} overflow-hidden`}>
                    <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-white/10 bg-[#FAFAFA]/5' : 'border-gray-100 bg-gray-50'}`}>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Manage Requests</h2>
                        <button onClick={onClose} className={`transition-colors text-2xl leading-none ${darkMode ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                            &times;
                        </button>
                    </div>

                    <div className={`flex p-1 mx-6 mt-6 rounded-xl border ${darkMode ? 'bg-[#FAFAFA]/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "received"
                                ? (darkMode ? "bg-[#FAFAFA] text-blue-700 shadow-lg" : "bg-[#FAFAFA] text-blue-600 shadow-md")
                                : (darkMode ? "text-white/60 hover:text-white hover:bg-[#FAFAFA]/5" : "text-slate-500 hover:text-slate-700")
                                }`}
                            onClick={() => setActiveTab("received")}
                        >
                            Received
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "sent"
                                ? (darkMode ? "bg-[#FAFAFA] text-blue-700 shadow-lg" : "bg-[#FAFAFA] text-blue-600 shadow-md")
                                : (darkMode ? "text-white/60 hover:text-white hover:bg-[#FAFAFA]/5" : "text-slate-500 hover:text-slate-700")
                                }`}
                            onClick={() => setActiveTab("sent")}
                        >
                            Sent
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className={`w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin`}></div>
                                <p className={`${darkMode ? 'text-white/40' : 'text-slate-400'} text-sm`}>Loading requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full ${darkMode ? 'bg-[#FAFAFA]/5' : 'bg-gray-100'}`}>
                                    <svg className={`w-10 h-10 ${darkMode ? 'text-white/20' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <p className={`${darkMode ? 'text-white/40' : 'text-slate-400'} text-sm italic`}>No {activeTab} requests found</p>
                            </div>
                        ) : (
                            requests.map((user) => (
                                <div key={user._id} className={`flex items-center justify-between gap-4 p-4 border rounded-2xl transition-all group ${darkMode ? 'bg-[#FAFAFA]/5 border-white/5 hover:bg-[#FAFAFA]/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={user.profilePicture || "/default-profile.jpg"}
                                            alt={user.name}
                                            width={48}
                                            height={48}
                                            className={`w-12 h-12 rounded-full object-cover border ${darkMode ? 'border-white/20 bg-gray-800' : 'border-white bg-[#FAFAFA] shadow-sm'}`}
                                        />
                                        <div className="min-w-0">
                                            <Link href={`/profile/${user.publicId || user._id}`} onClick={onClose}>
                                                <h3 className={`font-bold transition-colors truncate ${darkMode ? 'text-white hover:text-blue-300' : 'text-slate-900 hover:text-blue-600'}`}>{user.name}</h3>
                                            </Link>
                                            <p className={`text-xs truncate ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>{user.course || "Alumni"}</p>
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
                                                className="px-4 py-1.5 bg-[#FAFAFA]/10 text-white/60 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(user._id, "cancel")}
                                            className="px-4 py-1.5 bg-[#FAFAFA]/10 text-white/60 text-xs font-bold rounded-lg hover:bg-[#FAFAFA]/20 transition-all border border-white/10 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-[#FAFAFA]/5 border-t border-white/10 text-center">
                    <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-medium transition-colors">
                        Close Manager
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default RequestsModal;
