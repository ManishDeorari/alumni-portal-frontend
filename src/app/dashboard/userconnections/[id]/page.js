"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { getUserConnections, sendConnectionRequest } from "@/api/connect";
import { useParams } from "next/navigation";

const UserConnectionsPage = () => {
    const { id } = useParams();
    const { darkMode } = useTheme();
    const [connections, setConnections] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [requested, setRequested] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token");
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            try {
                // Get current user
                const meRes = await fetch(`${BASE_URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const meData = await meRes.json();
                setCurrentUser(meData);

                // Get user connections
                const data = await getUserConnections(id);
                setConnections(data || []);
            } catch (err) {
                console.error("Fetch initial data error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleConnect = async (toUserId) => {
        if (currentUser && toUserId === currentUser._id) return;
        try {
            await sendConnectionRequest(toUserId);
            setRequested((prev) => ({ ...prev, [toUserId]: true }));
        } catch (err) {
            console.error("Connect error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
            <Sidebar />
            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950' : 'bg-white'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => window.history.back()} className={`p-2.5 rounded-xl transition-all border ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-900"}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Connections</h1>
                        </div>
                        <span className={`px-5 py-2 border rounded-2xl text-sm font-black shadow-lg ${darkMode ? 'bg-white/5 border-white/10 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                            {connections.length} Total
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px]">Loading network...</p>
                    </div>
                ) : connections.length === 0 ? (
                    <div className={`text-center py-24 rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md ${darkMode ? 'bg-slate-950/50' : 'bg-white/10'}`}>
                        <p className="text-white/60 font-bold italic">No connections found for this user.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {connections.map((user) => (
                            <div key={user._id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between gap-5 shadow-2xl group transition-all relative overflow-hidden ${darkMode ? 'bg-slate-900 border-white/5 hover:border-blue-500/30' : 'bg-white border-gray-100 hover:border-blue-400/30'}`}>
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors ${darkMode ? 'bg-blue-500/5 group-hover:bg-blue-500/10' : 'bg-blue-50/50 group-hover:bg-blue-100/50'}`}></div>
                                <div className="flex items-center gap-4 min-w-0 relative z-10">
                                    <Image
                                        src={user.profilePicture || "/default-profile.jpg"}
                                        width={64}
                                        height={64}
                                        className={`rounded-2xl object-cover border-2 bg-gray-800 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl ${darkMode ? 'border-white/10' : 'border-gray-100'}`}
                                        alt={user.name || "User"}
                                    />
                                    <div className="min-w-0">
                                        <Link href={`/dashboard/profile?id=${user._id}`}>
                                            <h3 className={`font-black tracking-tight truncate transition-colors text-lg ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{user.name}</h3>
                                        </Link>
                                        <p className={`text-xs font-bold truncate uppercase tracking-tighter ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.course} • {user.year}</p>
                                        <div className={`mt-2 flex items-center gap-2`}>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                                                {user.workProfile?.industry || "Alumni"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    {currentUser && user._id === currentUser._id ? (
                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? "bg-blue-600/20 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                                            You
                                        </span>
                                    ) : user.connectionStatus === "connected" ? (
                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? "bg-green-600/20 text-green-300 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "bg-green-50 text-green-600 border-green-200"}`}>
                                            Friends
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(user._id)}
                                            disabled={requested[user._id]}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${requested[user._id]
                                                ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                                : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                                                }`}
                                        >
                                            {requested[user._id] ? "Pending" : "Connect"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserConnectionsPage;
