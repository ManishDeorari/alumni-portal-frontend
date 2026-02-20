import React, { useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react"; // Importing an icon for Points
import PointsDistributionModal from "./PointsDistributionModal";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileStats({ profile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

    if (!profile) return null;

    const connectionsLink = isPublicView
        ? `/dashboard/connections?userId=${profile._id}`
        : "/dashboard/myconnections";

    return (
        <div className="p-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden mt-4">
            <div className={`flex flex-wrap justify-between items-center w-full px-6 py-6 gap-6 rounded-[calc(1rem-1px)] transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Connections */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Connections</p>
                    <Link href={connectionsLink}>
                        <button className={`text-3xl font-normal transition-all active:scale-95 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                            {profile.connections?.length || 0}
                        </button>
                    </Link>
                </div>

                {/* Total Visitors */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Total Visitors</p>
                    <p className={`text-3xl font-normal ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{profile.visitStats?.totalVisits || 0}</p>
                </div>

                {/* Today's Visits */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${darkMode ? 'text-gray-400' : 'text-black'}`}>Today’s Visits</p>
                    <p className={`text-3xl font-normal ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{profile.visitStats?.todayVisits || 0}</p>
                </div>

                {/* My Points (Alumni Only) */}
                {profile.role === "alumni" && (
                    <div
                        className="flex flex-col items-center text-center cursor-pointer group flex-1 min-w-[120px]"
                        onClick={() => setIsPointsModalOpen(true)}
                    >
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-yellow-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-black'}`}>
                            {isPublicView ? "Points" : "My Points"}
                            <Award className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <p className={`text-3xl font-normal group-hover:scale-110 transition-transform ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>
                            {profile.points?.total || 0}
                        </p>
                    </div>
                )}
            </div>

            <PointsDistributionModal
                isOpen={isPointsModalOpen}
                onClose={() => setIsPointsModalOpen(false)}
                user={profile}
            />
        </div>
    );
}
