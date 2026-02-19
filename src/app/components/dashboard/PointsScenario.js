"use client";
import React, { useEffect, useState } from "react";
import { Award, Target, Zap, Heart, MessageSquare } from "lucide-react";

const PointsScenario = ({ darkMode = false }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin-points-mgmt/config`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setConfig(data);
            } catch (err) {
                console.error("Points Config Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    if (loading) return (
        <div className={`${darkMode ? "bg-slate-900" : "bg-white"} p-6 rounded-[2rem] animate-pulse space-y-4`}>
            <div className={`h-4 ${darkMode ? "bg-white/5" : "bg-gray-100"} rounded w-3/4`}></div>
            <div className={`h-20 ${darkMode ? "bg-white/5" : "bg-gray-50"} rounded-2xl`}></div>
        </div>
    );

    if (!config) return null;

    const scenarios = [
        { label: "Profile", value: config.profileCompletionPoints, icon: <Target className="w-4 h-4 text-blue-400" />, desc: "Complete your details" },
        { label: "Connect", value: config.connectionPoints, icon: <Zap className="w-4 h-4 text-amber-500" />, desc: "Grow your network" },
        { label: `Post (Max ${config.postLimitCount}/Week)`, value: config.postPoints, icon: <Award className="w-4 h-4 text-purple-600" />, desc: `Every ${config.postLimitDays} days` },
        { label: "Like", value: config.likePoints, icon: <Heart className="w-4 h-4 text-pink-500" />, desc: "React to others" },
        { label: "Comment", value: config.commentPoints, icon: <MessageSquare className="w-4 h-4 text-green-400" />, desc: "Engage in discussion" },
    ];

    return (
        <div className={`${darkMode ? "bg-slate-900" : "bg-white"} p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors duration-500 min-h-[460px] flex flex-col justify-between`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>

            <div>
                <div className="mb-4">
                    <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight flex items-center gap-2`}>
                        🎖️ Points System
                    </h3>
                    <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase tracking-widest mt-1`}>Earn & Rank Up</p>
                </div>

                <div className="space-y-1.5">
                    {scenarios.map((item, idx) => (
                        <div key={idx} className="p-[1px] bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl">
                            <div className={`flex items-center justify-between py-2.5 px-3.5 ${darkMode ? "bg-[#1e293b]" : "bg-white"} rounded-[11px] group/item shadow-sm hover:shadow-md transition-all`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${darkMode ? "bg-white/5" : "bg-gray-50"} rounded-lg group-hover/item:scale-110 transition-transform shadow-sm`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-800"} leading-tight`}>{item.label}</p>
                                        <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"} font-medium leading-tight`}>{item.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>+{item.value}</span>
                                    <p className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase tracking-tighter`}>pts</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`mt-6 pt-6 ${darkMode ? "border-white/5" : "border-gray-100"} border-t text-center`}>
                <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-bold italic leading-relaxed`}>
                    &quot;Consistent engagement leads to higher ranking!&quot;
                </p>
            </div>
        </div>
    );
};

export default PointsScenario;
