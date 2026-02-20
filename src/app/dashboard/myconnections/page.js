"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { getMyConnections } from "@/api/connect";
import { useTheme } from "@/context/ThemeContext";

const MyConnectionsPage = () => {
    const { darkMode } = useTheme();
    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const data = await getMyConnections();
                setConnections(data || []);
            } catch (err) {
                console.error("Fetch connections error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConnections();
    }, []);

    const filteredConnections = connections.filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
            <Sidebar />
            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-black text-white' : 'bg-white text-slate-900'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/network" className={`p-2.5 rounded-xl transition-all border ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-900'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <div>
                                <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Network</h1>
                                <p className={`text-sm font-medium ${darkMode ? 'text-blue-100/60' : 'text-slate-500'}`}>{connections.length} Total Connections</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80 p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl focus-within:shadow-lg transition-all">
                            <input
                                type="text"
                                placeholder="Filter connections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-12 pr-4 py-2.5 rounded-2xl outline-none transition-all font-bold text-xs uppercase tracking-widest ${darkMode ? 'bg-slate-900 text-white placeholder-white/20' : 'bg-white/90 text-slate-900 placeholder-gray-400'}`}
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
                    <div className={`text-center py-24 rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md ${darkMode ? 'bg-slate-950/50' : 'bg-white/10'}`}>
                        <div className={`p-5 w-fit mx-auto rounded-full mb-6 ${darkMode ? 'bg-white/5 shadow-inner' : 'bg-blue-50'}`}>
                            <svg className={`w-10 h-10 ${darkMode ? 'text-white/10' : 'text-blue-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-white/60 font-bold mb-8 italic">
                            {searchQuery ? "No connections found matching your search" : "Your professional circle is empty"}
                        </p>
                        <Link href="/dashboard/network" className="px-8 py-3.5 bg-white text-blue-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl active:scale-95 inline-block">
                            Expand Your Network
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                        {filteredConnections.map((user) => (
                            <div key={user._id} className="relative p-[1px] bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-[2.5rem] group hover:from-blue-400 hover:to-purple-400 transition-all duration-500 shadow-xl">
                                <div className={`p-5 rounded-[2.5rem] flex items-center justify-between gap-5 transition-all relative overflow-hidden h-full ${darkMode ? 'bg-slate-900 border-white/5 hover:border-blue-500/30' : 'bg-white border-gray-100 hover:border-blue-400/30'}`}>
                                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors ${darkMode ? 'bg-blue-500/5 group-hover:bg-blue-500/10' : 'bg-blue-50/50 group-hover:bg-blue-100/50'}`}></div>
                                    <div className="flex items-center gap-4 min-w-0 relative z-10 flex-1">
                                        <div className="relative p-[1px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <Image
                                                src={user.profilePicture || "/default-profile.jpg"}
                                                width={80}
                                                height={80}
                                                className={`w-20 h-20 rounded-full object-cover border-4 transition-all ${darkMode ? 'border-slate-800' : 'border-white'}`}
                                                alt={user.name || "User"}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/dashboard/profile?id=${user._id}`}>
                                                <h3 className={`font-black tracking-tight truncate transition-colors text-xl ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{user.name}</h3>
                                            </Link>
                                            <p className={`text-sm font-bold truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.course} • {user.year}</p>
                                            <div className={`mt-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border w-fit ${darkMode ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                                {user.workProfile?.industry || "Alumni"}
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/dashboard/messages?userId=${user._id}`}
                                        className={`relative z-10 p-4 rounded-2xl transition-all shadow-lg active:scale-90 flex items-center justify-center shrink-0 ${darkMode ? 'bg-white/5 text-white hover:bg-white hover:text-blue-700 border border-white/5' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
                                        title="Message"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyConnectionsPage;
