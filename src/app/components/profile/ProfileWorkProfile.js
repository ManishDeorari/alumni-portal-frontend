"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditWorkProfileModal from "./modals/EditWorkProfileModal";
import { Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";

export default function ProfileWorkProfile({ profile, setProfile, isPublicView }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            workProfile: updatedUser.workProfile,
            skills: updatedUser.skills,
        }));
    };

    const hasData = profile.workProfile?.functionalArea || profile.workProfile?.industry;

    return (
        <>
            <SectionCard title="Work Profile" hasData={Object.keys(profile.workProfile || {}).length > 0} onEdit={() => setIsEditing(true)} isPublicView={isPublicView}>
                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-blue-100 p-2 rounded-lg">
                                    <BarChart className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Functional Area</p>
                                    <p className="text-gray-900 font-semibold">{profile.workProfile?.functionalArea || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-purple-100 p-2 rounded-lg">
                                    <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sub-Functional Area</p>
                                    <p className="text-gray-900 font-semibold">{profile.workProfile?.subFunctionalArea || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-orange-100 p-2 rounded-lg">
                                    <Layers className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Experience</p>
                                    <p className="text-gray-900 font-semibold">{profile.workProfile?.experience || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-green-100 p-2 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Industry</p>
                                    <p className="text-gray-900 font-semibold">{profile.workProfile?.industry || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        {profile.skills?.length > 0 && (
                            <div className="col-span-full pt-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                                        <Code className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No work profile details added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditWorkProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentWorkProfile={profile.workProfile}
                currentSkills={profile.skills || []}
                onSave={handleSave}
            />
        </>
    );
}
