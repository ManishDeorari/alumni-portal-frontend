import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditJobPreferenceModal from "./modals/EditJobPreferenceModal";
import { Heart, MapPin, Clock, DollarSign, FileText, ExternalLink, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileJobPreference({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
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
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-red-900/40' : 'bg-red-50'}`}>
                                    <Heart className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Preferred Area</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.jobPreferences?.functionalArea || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                                    <MapPin className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Preferred Locations</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {profile.jobPreferences?.preferredLocations?.length > 0
                                            ? profile.jobPreferences.preferredLocations.join(", ")
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-orange-900/40' : 'bg-orange-50'}`}>
                                    <Clock className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Notice Period</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.jobPreferences?.noticePeriod || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-green-900/40' : 'bg-green-50'}`}>
                                    <DollarSign className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Expected Salary</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.jobPreferences?.salary || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full pt-2">
                            <div className="flex flex-wrap gap-4">
                                {profile.jobPreferences?.resumeLink && (
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-purple-900/40' : 'bg-purple-50'}`}>
                                            <FileText className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Resume / CV</p>
                                            <a
                                                href={profile.jobPreferences.resumeLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                            >
                                                View Professional Resume <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {profile.jobPreferences?.portfolioLink && (
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                                            <Globe className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Portfolio Website</p>
                                            <a
                                                href={profile.jobPreferences.portfolioLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            >
                                                Visit Portfolio <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!profile.jobPreferences?.resumeLink && !profile.jobPreferences?.portfolioLink && (
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-purple-900/40' : 'bg-purple-50'}`}>
                                        <FileText className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                    </div>
                                    <p className={`text-sm italic font-medium py-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No resume or portfolio link provided</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Heart className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No job preferences added yet.</p>
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
