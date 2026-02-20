import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditWorkProfileModal from "./modals/EditWorkProfileModal";
import { Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileWorkProfile({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
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
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                                    <BarChart className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Functional Area</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.workProfile?.functionalArea || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                                    <Settings className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sub-Functional Area</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.workProfile?.subFunctionalArea || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-orange-900/40' : 'bg-orange-100'}`}>
                                    <Layers className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Experience</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.workProfile?.experience || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-green-900/40' : 'bg-green-100'}`}>
                                    <Briefcase className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Industry</p>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{profile.workProfile?.industry || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        {profile.skills?.length > 0 && (
                            <div className="col-span-full pt-2">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                        <Code className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, i) => (
                                                <span key={i} className={`px-3 py-1 text-xs font-semibold rounded-full border ${darkMode ? 'bg-slate-800 text-gray-300 border-white/10' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
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
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Briefcase className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No work profile details added yet.</p>
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
