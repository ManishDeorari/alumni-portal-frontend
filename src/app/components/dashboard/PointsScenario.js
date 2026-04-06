"use client";
import React, { useEffect, useState } from "react";
import { Award, Target, Zap, Heart, MessageSquare, CheckCircle2 } from "lucide-react";
import socket from "@/utils/socket";

const PointsScenario = ({ darkMode = false }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = React.useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchConfig();
        
        // Live updates for admin config changes
        socket.on("pointsConfigUpdated", () => {
            fetchConfig();
        });

        // Live updates for personal point achievements
        socket.on("newNotification", (notif) => {
            if (notif.type === "points_earned") {
                fetchConfig();
            }
        });

        return () => {
            socket.off("pointsConfigUpdated");
            socket.off("newNotification");
        };
    }, [fetchConfig]);

    if (loading) return (
        <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-6 rounded-[2rem] animate-pulse space-y-4`}>
            <div className={`h-4 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-100"} rounded w-3/4`}></div>
            <div className={`h-20 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-50"} rounded-2xl`}></div>
        </div>
    );

    if (!config) return null;

    const scenarios = [
        { 
            label: "Profile", 
            value: config.profileCompletionPoints || 50, 
            icon: <Target className="w-4 h-4 text-blue-400" />, 
            desc: "Complete your details",
            completed: config.userStatus?.isProfileComplete 
        },
        { 
            label: "Connect", 
            value: config.connectionPoints || 10, 
            icon: <Zap className="w-4 h-4 text-amber-500" />, 
            desc: "Grow your network",
            completed: false // Not tracked via frequency limit logs yet
        },
        { 
            label: `Post (Max ${config.postLimitCount || 3}/${config.postLimitDays === 7 ? "Week" : (config.postLimitDays || 7) + " Days"})`, 
            value: config.postPoints || 10, 
            icon: <Award className="w-4 h-4 text-purple-600" />, 
            desc: `Every ${config.postLimitDays || 7} days`,
            completed: config.userStatus?.isPostLimitReached
        },
        { 
            label: `Like (Max ${config.likeLimitCount || 10}/${config.likeLimitDays === 1 ? "Day" : (config.likeLimitDays || 1) + " Days"})`, 
            value: config.likePoints || 2, 
            icon: <Heart className="w-4 h-4 text-pink-500" />, 
            desc: "React to others" ,
            completed: config.userStatus?.isLikeLimitReached
        },
        { 
            label: `Comment (Max ${config.commentLimitCount || 5}/${config.commentLimitDays === 1 ? "Day" : (config.commentLimitDays || 1) + " Days"})`, 
            value: config.commentPoints || 3, 
            icon: <MessageSquare className="w-4 h-4 text-green-400" />, 
            desc: "Engage in discussion",
            completed: config.userStatus?.isCommentLimitReached
        },
    ];

    return (
        <div className={`${darkMode ? "bg-[#121213]" : "bg-[#FAFAFA]"} p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors duration-500 min-h-[460px] flex flex-col justify-between`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>

            <div>
                <div className="mb-4">
                    <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight flex items-center gap-2`}>
                        🎖️ Points System
                    </h3>
                    <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase tracking-widest mt-1`}>Earn &amp; Rank Up</p>
                </div>

                <div className="space-y-1.5">
                    {scenarios.map((item, idx) => (
                        <div key={idx} className="p-[1px] bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl">
                            <div className={`flex items-center justify-between py-2.5 px-3.5 ${darkMode ? "bg-[#1e293b]" : "bg-[#FAFAFA]"} rounded-[11px] group/item shadow-sm hover:shadow-md transition-all`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-50"} rounded-lg group-hover/item:scale-110 transition-transform shadow-sm`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-800"} leading-tight`}>{item.label}</p>
                                        <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"} font-medium leading-tight`}>{item.desc}</p>
                                    </div>
                                </div>
                                    <div className="text-right flex items-center gap-3">
                                        {item.completed && (
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/20 animate-in zoom-in duration-300">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div className={`transition-opacity duration-300 ${item.completed ? "opacity-40" : "opacity-100"}`}>
                                            <span className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>+{item.value}</span>
                                            <p className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-400"} font-black uppercase tracking-tighter`}>pts</p>
                                        </div>
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
