"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return url.endsWith("/") ? url.slice(0, -1) : url;
};
const API = getApiUrl();

export default function PointsSystemManagement() {
    const [config, setConfig] = useState({
        profileCompletionPoints: 50,
        connectionPoints: 10,
        postPoints: 10,
        postLimitCount: 3,
        postLimitDays: 7,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Manual Award State
    const [search, setSearch] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("other");
    const [awarding, setAwarding] = useState(false);

    const CATEGORY_LABELS = {
        profileCompletion: "Profile Completion",
        studentEngagement: "Student Engagement",
        referrals: "Referrals",
        contentContribution: "Content Contribution",
        campusEngagement: "Campus Engagement",
        innovationSupport: "Innovation Support",
        alumniParticipation: "Alumni Participation",
        connections: "Networking",
        posts: "Posts",
        comments: "Comments",
        likes: "Reactions",
        replies: "Replies",
        other: "Other Activities",
    };

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/config`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) {
                const text = await res.text();
                console.error("Fetch Config Error:", text);
                throw new Error(`Server returned ${res.status}`);
            }
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load points configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                toast.success("Configuration updated successfully!");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Update failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleManualAward = async (e) => {
        e.preventDefault();
        if (!search || !amount) return toast.error("Please fill search and amount");
        setAwarding(true);
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/manual-award`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ search, amount: Number(amount), message, category }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Awarded ${amount} points to ${data.user.name}`);
                setSearch("");
                setAmount("");
                setMessage("");
                setCategory("other");
            } else {
                throw new Error(data.message || "Awarding failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAwarding(false);
        }
    };

    const triggerRollover = async () => {
        if (!window.confirm("ARE YOU SURE? This will reset all current points and logs for ALL alumni!")) return;
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/trigger-rollover`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                toast.success("Rollover executed successfully!");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Rollover failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const triggerSync = async () => {
        if (!window.confirm("This will recalculate all users' points and assign discrepancies to 'Other'. Continue?")) return;
        try {
            const res = await fetch(`${API}/api/admin-points-mgmt/sync-points`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
            } else {
                throw new Error(data.message || "Sync failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div>Loading config...</div>;

    return (
        <div className="space-y-10 pb-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Settings Section */}
            <section className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-blue-400/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                    <span className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">⚙️</span>
                    Global System Config
                </h2>
                <form onSubmit={handleUpdateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { label: "Profile Completion", key: "profileCompletionPoints" },
                        { label: "Networking (Connect)", key: "connectionPoints" },
                        { label: "Post Creation", key: "postPoints" },
                        { label: "Post Likes", key: "likePoints" },
                        { label: "Post Comments", key: "commentPoints" },
                        { label: "Post Frequency Limit", key: "postLimitCount", sub: "Max posts" },
                        { label: "Post Window (Days)", key: "postLimitDays", sub: "Rolling days" },
                    ].map((item) => (
                        <div key={item.key} className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 ml-1">
                                {item.label}
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    value={config[item.key]}
                                    onChange={(e) => setConfig({ ...config, [item.key]: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-400 focus:bg-white/10 outline-none transition-all text-white font-bold shadow-inner"
                                />
                                {item.sub && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-100/20 uppercase">{item.sub}</span>}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2 group/btn"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    Save System Config
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {/* Manual Award Section */}
            <section className="bg-gray-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-green-400/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors"></div>
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                    <span className="p-3 bg-green-600/20 rounded-2xl text-green-400">🏆</span>
                    Custom Points Grant
                </h2>
                <form onSubmit={handleManualAward} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 ml-1">Search Recipient</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-green-400 focus:bg-white/10 outline-none transition-all text-white font-bold shadow-inner placeholder-white/10"
                                    placeholder="Name or ID..."
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 ml-1">Grant Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-400 focus:bg-white/10 outline-none transition-all text-white font-bold shadow-inner"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 ml-1">Activity Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#1a1a2e] border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-400 focus:bg-[#252545] outline-none transition-all text-white font-bold shadow-inner appearance-none cursor-pointer"
                            >
                                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 ml-1">Custom Note (Appears in User Notification)</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-green-400 focus:bg-white/10 outline-none transition-all text-white font-bold shadow-inner placeholder-white/10"
                            placeholder="e.g. Exceptional contribution to the annual tech summit..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={awarding}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                        {awarding ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                Grant Points & Notify User
                            </>
                        )}
                    </button>
                </form>
            </section>

            {/* Danger Zone / Rollover / Sync */}
            <section className="bg-red-500/10 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-red-500/20 shadow-2xl relative overflow-hidden group">
                <h2 className="text-2xl font-black text-red-400 mb-8 flex items-center gap-3">
                    <span className="p-3 bg-red-600/20 rounded-2xl text-red-400">⚠️</span>
                    Advanced Data Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-red-500/30 transition-all">
                        <h3 className="text-lg font-black text-white/90">Season Rollover</h3>
                        <p className="text-sm text-blue-100/40 leading-relaxed">
                            Resets all current season points and moves balances to <span className="text-red-300 font-bold">Historical Rankings</span>. This action is irreversible.
                        </p>
                        <button
                            onClick={triggerRollover}
                            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            Trigger Annual Rollover
                        </button>
                    </div>
                    <div className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all">
                        <h3 className="text-lg font-black text-white/90">Consistency Sync</h3>
                        <p className="text-sm text-blue-100/40 leading-relaxed">
                            Recalculates point aggregates for all users and cleans up orphaned point logs. <span className="text-purple-300 font-bold">Safe to run.</span>
                        </p>
                        <button
                            onClick={triggerSync}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            Execute Global Sync
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
