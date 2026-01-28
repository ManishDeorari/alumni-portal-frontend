"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditJobPreferenceModal from "./modals/EditJobPreferenceModal";
import { Heart, MapPin, Clock, DollarSign, FileText, ExternalLink, Globe } from "lucide-react";

export default function ProfileJobPreference({ profile, setProfile, isPublicView }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            jobPreferences: updatedUser.jobPreferences,
        }));
    };

    const hasData = profile.jobPreferences?.functionalArea || profile.jobPreferences?.preferredLocations?.length > 0;

    return (
        <>
            <SectionCard
                title="Job Preferences"
                hasData={Object.keys(profile.jobPreferences || {}).length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-red-50 p-2 rounded-lg">
                                    <Heart className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Area</p>
                                    <p className="text-gray-900 font-semibold">{profile.jobPreferences?.functionalArea || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-blue-50 p-2 rounded-lg">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Locations</p>
                                    <p className="text-gray-900 font-semibold">
                                        {profile.jobPreferences?.preferredLocations?.length > 0
                                            ? profile.jobPreferences.preferredLocations.join(", ")
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-orange-50 p-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notice Period</p>
                                    <p className="text-gray-900 font-semibold">{profile.jobPreferences?.noticePeriod || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-green-50 p-2 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expected Salary</p>
                                    <p className="text-gray-900 font-semibold">{profile.jobPreferences?.salary || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full pt-2">
                            <div className="flex flex-wrap gap-4">
                                {profile.jobPreferences?.resumeLink && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-purple-50 p-2 rounded-lg">
                                            <FileText className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resume / CV</p>
                                            <a
                                                href={profile.jobPreferences.resumeLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition shadow-sm"
                                            >
                                                View Professional Resume <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {profile.jobPreferences?.portfolioLink && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-blue-50 p-2 rounded-lg">
                                            <Globe className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Portfolio Website</p>
                                            <a
                                                href={profile.jobPreferences.portfolioLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
                                            >
                                                Visit Portfolio <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!profile.jobPreferences?.resumeLink && !profile.jobPreferences?.portfolioLink && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 bg-purple-50 p-2 rounded-lg">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <p className="text-gray-400 text-sm italic font-medium py-2">No resume or portfolio link provided</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No job preferences added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditJobPreferenceModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentPreferences={profile.jobPreferences}
                onSave={handleSave}
            />
        </>
    );
}
