"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Link from "next/link";
import { getUserConnections, sendConnectionRequest } from "@/api/connect";
import { useParams } from "next/navigation";

const UserConnectionsPage = () => {
    const { id } = useParams();
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
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-800/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50"></div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-3xl font-black tracking-tight">Connections</h1>
                    </div>
                    <span className="px-5 py-2 bg-white/5 border border-white/10 text-blue-100 rounded-2xl text-sm font-black shadow-lg">
                        {connections.length} Total
                    </span>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-100/60 font-black uppercase tracking-widest text-xs">Loading network...</p>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-24 bg-gray-800/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10">
                        <p className="text-blue-100/60 font-bold italic">No connections found for this user.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {connections.map((user) => (
                            <div key={user._id} className="bg-gray-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 flex items-center justify-between gap-5 shadow-lg group hover:border-blue-400/30 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="flex items-center gap-4 min-w-0 relative z-10">
                                    <img
                                        src={user.profilePicture || "/default-profile.jpg"}
                                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 bg-gray-800 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl"
                                        alt={user.name}
                                    />
                                    <div className="min-w-0">
                                        <Link href={`/dashboard/profile?id=${user._id}`}>
                                            <h3 className="font-extrabold text-white group-hover:text-blue-300 truncate transition-colors text-lg tracking-tight">{user.name}</h3>
                                        </Link>
                                        <p className="text-xs text-blue-100/60 font-medium truncate">{user.course} • {user.year}</p>
                                        <p className="text-[10px] text-blue-400 font-black mt-2 truncate uppercase tracking-[0.15em] bg-blue-400/10 w-fit px-3 py-1 rounded-full">{user.workProfile?.industry || "Alumni"}</p>
                                    </div>
                                </div>

                                {currentUser && user._id === currentUser._id ? (
                                    <span className="px-6 py-2.5 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-black border border-blue-500/30 ring-1 ring-blue-400/20">
                                        You
                                    </span>
                                ) : user.connectionStatus === "connected" ? (
                                    <span className="px-5 py-2.5 bg-green-500/20 text-green-300 rounded-2xl text-sm font-black flex items-center gap-2 border border-green-500/30">
                                        Friends
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(user._id)}
                                        disabled={requested[user._id]}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex-shrink-0 ${requested[user._id]
                                            ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                            : "bg-white text-blue-700 hover:bg-blue-50"
                                            }`}
                                    >
                                        {requested[user._id] ? "Requested" : "Connect"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserConnectionsPage;
