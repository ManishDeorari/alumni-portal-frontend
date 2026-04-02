"use client";
import React, { useEffect, useState, Suspense } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import { getMyConnections, getUserConnections, sendConnectionRequest } from "@/api/connect";
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from "next/navigation";

const MyConnectionsContent = () => {
    const { darkMode } = useTheme();
    const searchParams = useSearchParams();
    const userIdInParam = searchParams.get("id");

    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [ownerName, setOwnerName] = useState("My");
    const [requested, setRequested] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

                // Fetch current user info for status comparison
                const meRes = await fetch(`${BASE_URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const meData = await meRes.json();
                setCurrentUser(meData);

                let data;
                if (userIdInParam) {
                    const res = await fetch(`${BASE_URL}/api/connect/user/${userIdInParam}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    data = await res.json();
                    
                    // Also try to get the owner name if possible (or title logic)
                    if (userIdInParam !== meData?._id) {
                        setOwnerName("Alumni's"); // Generic fallback or fetch logic
                    }
                } else {
                    data = await getMyConnections();
                    setOwnerName("My");
                }
                setConnections(data || []);
            } catch (err) {
                console.error("Fetch connections error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userIdInParam]);

    const handleConnect = async (toUserId) => {
        try {
            await sendConnectionRequest(toUserId);
            setRequested(prev => ({ ...prev, [toUserId]: true }));
        } catch (err) {
            console.error("Connect error:", err);
        }
    };

    const isConnected = (targetId) => {
        return currentUser?.connections?.includes(targetId) || userIdInParam === null;
    };

    const filteredConnections = connections.filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const userObj = currentUser || JSON.parse(localStorage.getItem("user"));
        setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
    }, [currentUser]);

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
            <SidebarComponent />
            <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black text-white' : 'bg-[#FAFAFA] text-slate-900'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/network" className={`p-2.5 rounded-xl transition-all border ${darkMode ? 'bg-[#FAFAFA]/5 border-white/10 hover:bg-[#FAFAFA]/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-900'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <div>
                                <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ownerName} Network</h1>
                                <p className={`text-sm font-medium ${darkMode ? 'text-blue-100/60' : 'text-slate-500'}`}>{connections.length} Total Connections</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80 p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl focus-within:shadow-lg transition-all">
                            <input
                                type="text"
                                placeholder="Filter connections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-12 pr-4 py-2.5 rounded-2xl outline-none transition-all font-bold text-xs uppercase tracking-widest ${darkMode ? 'bg-[#121213] text-white placeholder-white/20' : 'bg-[#FAFAFA]/90 text-slate-900 placeholder-gray-400'}`}
                            />
                            <svg className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-opacity ${darkMode ? 'text-white/20' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px]">Syncing your network...</p>
                    </div>
                ) : filteredConnections.length === 0 ? (
                    <div className={`text-center py-24 rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md ${darkMode ? 'bg-slate-950/50' : 'bg-[#FAFAFA]/10'}`}>
                        <div className={`p-5 w-fit mx-auto rounded-full mb-6 ${darkMode ? 'bg-[#FAFAFA]/5 shadow-inner' : 'bg-blue-50'}`}>
                            <svg className={`w-10 h-10 ${darkMode ? 'text-white/10' : 'text-blue-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-white/60 font-bold mb-8 italic">
                            {searchQuery ? "No connections found matching your search" : "The network is quiet for now..."}
                        </p>
                        <Link href="/dashboard/network" className="px-8 py-3.5 bg-[#FAFAFA] text-blue-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl active:scale-95 inline-block">
                            Expand Your Network
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                        {filteredConnections.map((user) => {
                            const isUserConnected = isConnected(user._id);
                            const isSent = requested[user._id];
                            
                            return (
                                <div key={user._id} className="relative p-[1px] bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-3xl group hover:from-blue-400 hover:to-purple-400 transition-all duration-500 shadow-xl overflow-hidden">
                                    <div className={`p-4 rounded-[calc(1.5rem-1px)] flex flex-col items-center text-center transition-all relative overflow-hidden h-full ${darkMode ? 'bg-black border-white/5 hover:border-blue-500/30' : 'bg-[#FAFAFA] border-gray-100 hover:border-blue-400/30'}`}>
                                        
                                        {/* Vertical Identity Stack (Avatar) */}
                                        <Link 
                                            href={`/profile/${user.publicId || user._id}`}
                                            className="relative p-[1px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-lg mt-2 mb-3 block"
                                        >
                                            <Image
                                                src={user.profilePicture || "/default-profile.jpg"}
                                                width={64}
                                                height={64}
                                                className={`w-14 h-14 rounded-full object-cover border-2 transition-all ${darkMode ? 'border-slate-800' : 'border-white'}`}
                                                alt={user.name || "User"}
                                            />
                                        </Link>

                                        {/* Name and ID Section */}
                                        <div className="w-full min-w-0">
                                            <Link href={`/profile/${user.publicId || user._id}`}>
                                                <h3 className={`font-black tracking-tight truncate transition-colors text-sm ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {user.name}
                                                </h3>
                                            </Link>
                                            
                                            {/* Enrollment / Employee ID */}
                                            <p className={`text-[10px] font-black uppercase tracking-wider mt-1 opacity-70 ${darkMode ? 'text-white' : 'text-slate-600'}`}>
                                                {user.enrollmentNumber || user.employeeId || (user.role === "faculty" ? "Faculty" : "Alumni")}
                                            </p>
                                        </div>

                                        {/* Action Section (Replaced dot fields) */}
                                        <div className="mt-4 w-full">
                                            {isUserConnected ? (
                                                <div className="text-[10px] font-black uppercase text-blue-500 border border-blue-500/20 py-2 rounded-xl bg-blue-500/5 w-full">
                                                    Connected
                                                </div>
                                            ) : isSent ? (
                                                <div className="text-[10px] font-black uppercase text-gray-500 border border-gray-500/20 py-2 rounded-xl bg-gray-500/5 w-full">
                                                    Pending
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleConnect(user._id)}
                                                    className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                                                >
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

const MyConnectionsPage = () => (
    <Suspense fallback={
        <div className="min-h-screen bg-[#121213] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    }>
        <MyConnectionsContent />
    </Suspense>
);

export default MyConnectionsPage;
