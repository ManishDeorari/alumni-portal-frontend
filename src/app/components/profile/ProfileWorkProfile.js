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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-[1px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <BarChart className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Functional Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.workProfile?.functionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <Settings className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Sub-Functional Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.workProfile?.subFunctionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <Layers className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Total Experience</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.workProfile?.experience || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <Briefcase className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Industry</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.workProfile?.industry || "Not specified"}</span>
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
