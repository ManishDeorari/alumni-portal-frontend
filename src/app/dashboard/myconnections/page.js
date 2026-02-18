"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { getMyConnections } from "@/api/connect";

const MyConnectionsPage = () => {
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
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-800/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/network" className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">My Network</h1>
                            <p className="text-blue-100/60 text-sm font-medium">{connections.length} Total Connections</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Filter connections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-blue-400/50 transition-all font-medium"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-100/60 font-black uppercase tracking-widest text-xs">Syncing your network...</p>
                    </div>
                ) : filteredConnections.length === 0 ? (
                    <div className="text-center py-24 bg-gray-800/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10">
                        <div className="p-5 bg-white/5 w-fit mx-auto rounded-full mb-6">
                            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-blue-100/60 font-bold mb-8 italic">
                            {searchQuery ? "No connections found matching your search" : "Your professional circle is empty"}
                        </p>
                        <Link href="/dashboard/network" className="px-8 py-3.5 bg-white text-blue-700 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95 inline-block">
                            Expand Your Network
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredConnections.map((user) => (
                            <div key={user._id} className="bg-gray-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 flex items-center gap-5 hover:border-blue-400/30 transition-all shadow-lg group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors"></div>
                                <Image
                                    src={user.profilePicture || "/default-profile.jpg"}
                                    width={80}
                                    height={80}
                                    className="rounded-2xl object-cover border-2 border-white/10 bg-gray-800 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl"
                                    alt={user.name || "User"}
                                />
                                <div className="flex-1 min-w-0 relative z-10">
                                    <Link href={`/dashboard/profile?id=${user._id}`}>
                                        <h3 className="font-extrabold text-white group-hover:text-blue-300 truncate transition-colors text-xl tracking-tight">{user.name}</h3>
                                    </Link>
                                    <p className="text-sm text-blue-100/60 font-medium truncate">{user.course} • {user.year}</p>
                                    <p className="text-[10px] text-blue-400 font-black mt-2 truncate uppercase tracking-[0.15em] bg-blue-400/10 w-fit px-3 py-1 rounded-full">{user.workProfile?.industry || "Alumni"}</p>
                                </div>
                                <Link
                                    href={`/dashboard/messages?userId=${user._id}`}
                                    className="relative z-10 p-3.5 bg-white/5 hover:bg-white text-white hover:text-blue-700 rounded-2xl transition-all border border-white/5 shadow-lg active:scale-90"
                                    title="Message"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyConnectionsPage;
