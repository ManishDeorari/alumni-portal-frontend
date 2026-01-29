import React, { useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react"; // Importing an icon for Points
import PointsDistributionModal from "./PointsDistributionModal";

export default function ProfileStats({ profile, isPublicView }) {
    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

    if (!profile) return null;

    const connectionsLink = isPublicView
        ? `/dashboard/userconnections/${profile._id}`
        : "/dashboard/myconnections";

    return (
        <div className="flex justify-between items-end w-full px-6 pt-6 pb-2 mt-4">
            {/* Connections */}
            <div className="flex flex-col items-center text-center">
                <p className="text-sm text-gray-500">Connections</p>
                <Link href={connectionsLink}>
                    <button className="text-xl font-bold text-blue-600 hover:underline transition-all active:scale-95">
                        {profile.connections?.length || 0}
                    </button>
                </Link>
            </div>

            {/* Total Visitors */}
            <div className="flex flex-col items-center text-center">
                <p className="text-sm text-gray-500">Total Visitors</p>
                <p className="text-xl font-bold text-purple-600">{profile.visitStats?.totalVisits || 0}</p>
            </div>

            {/* Today's Visits */}
            <div className="flex flex-col items-center text-center">
                <p className="text-sm text-gray-500">Today’s Visits</p>
                <p className="text-xl font-bold text-green-600">{profile.visitStats?.todayVisits || 0}</p>
            </div>

            {/* My Points (Alumni Only) */}
            {profile.role === "alumni" && (
                <div
                    className="flex flex-col items-center text-center cursor-pointer group"
                    onClick={() => setIsPointsModalOpen(true)}
                >
                    <div className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                        {isPublicView ? "Points" : "My Points"}
                        <Award className="w-3 h-3 text-yellow-500" />
                    </div>
                    <p className="text-xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">
                        {profile.points?.total || 0}
                    </p>
                </div>
            )}

            <PointsDistributionModal
                isOpen={isPointsModalOpen}
                onClose={() => setIsPointsModalOpen(false)}
                user={profile}
            />
        </div>
    );
}
