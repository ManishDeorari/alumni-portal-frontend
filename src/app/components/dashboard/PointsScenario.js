"use client";
import React, { useEffect, useState } from "react";
import { Award, Target, Zap, Heart, MessageSquare } from "lucide-react";

const PointsScenario = () => {
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
        <div className="bg-white p-6 rounded-[2rem] border border-gray-200 animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-20 bg-gray-50 rounded-2xl"></div>
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
        <div className="bg-white p-4 rounded-[2rem] border border-gray-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>

            <div className="mb-3">
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    🎖️ Points System
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Earn & Rank Up</p>
            </div>

            <div className="space-y-2">
                {scenarios.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all hover:bg-white group/item shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg group-hover/item:scale-110 transition-transform shadow-sm">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800 leading-tight">{item.label}</p>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">{item.desc}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-gray-900">+{item.value}</span>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">pts</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">
                    "Consistent engagement leads to higher ranking!"
                </p>
            </div>
        </div>
    );
};

export default PointsScenario;
