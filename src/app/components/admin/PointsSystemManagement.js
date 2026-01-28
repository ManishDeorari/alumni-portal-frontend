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
    const [awarding, setAwarding] = useState(false);

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
                body: JSON.stringify({ search, amount: Number(amount), message }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Awarded ${amount} points to ${data.user.name}`);
                setSearch("");
                setAmount("");
                setMessage("");
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

    if (loading) return <div>Loading config...</div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Settings Section */}
            <section className="bg-white/10 p-6 rounded-xl border border-white/20">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    ⚙️ Global Points Settings
                </h2>
                <form onSubmit={handleUpdateConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Profile Completion Points</label>
                        <input
                            type="number"
                            value={config.profileCompletionPoints}
                            onChange={(e) => setConfig({ ...config, profileCompletionPoints: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Connection Points</label>
                        <input
                            type="number"
                            value={config.connectionPoints}
                            onChange={(e) => setConfig({ ...config, connectionPoints: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Post Points</label>
                        <input
                            type="number"
                            value={config.postPoints}
                            onChange={(e) => setConfig({ ...config, postPoints: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Post Limit (Count)</label>
                        <input
                            type="number"
                            value={config.postLimitCount}
                            onChange={(e) => setConfig({ ...config, postLimitCount: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="e.g. 3"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Post Limit (Days)</label>
                        <input
                            type="number"
                            value={config.postLimitDays}
                            onChange={(e) => setConfig({ ...config, postLimitDays: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="e.g. 7"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Manual Award Section */}
            <section className="bg-white/10 p-6 rounded-xl border border-white/20">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🏆 Manual Point Award
                </h2>
                <form onSubmit={handleManualAward} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-white/70">Search User (Name or Enrollment #)</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Ex: John Doe or 2021ALUM01"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-white/70">Points to Award</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Ex: 50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Notification Message (Optional)</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="Ex: Great contribution to the session!"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={awarding}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {awarding ? "Awarding..." : "Award Points"}
                    </button>
                </form>
            </section>

            {/* Danger Zone / Rollover */}
            <section className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                    ⚠️ Year-End Rollover
                </h2>
                <p className="text-sm text-white/70 mb-4">
                    Clicking the button below will copy everyone's current total points to "Previous Year Points" and reset their current balance to zero. This should only be done once a year.
                </p>
                <button
                    onClick={triggerRollover}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors"
                >
                    Execute Year-End Rollover Now
                </button>
            </section>
        </div>
    );
}
