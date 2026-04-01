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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-[1px] bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <Heart className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Preferred Area</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.jobPreferences?.functionalArea || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <MapPin className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Preferred Locations</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {profile.jobPreferences?.preferredLocations?.length > 0 
                                      ? profile.jobPreferences.preferredLocations.join(", ") 
                                      : "Not specified"}
                                </span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <Clock className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Notice Period</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.jobPreferences?.noticePeriod || "Not specified"}</span>
                            </div>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl">
                            <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                <div className={`mb-3 p-2 rounded-full ${darkMode ? 'bg-[#121213]' : 'bg-white'} shadow-sm`}>
                                    <DollarSign className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                </div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-white' : 'text-black'}`}>Expected Salary</label>
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{profile.jobPreferences?.salary || "Not specified"}</span>
                            </div>
                        </div>

                        {profile.jobPreferences?.resumeLink && (
                            <div className="p-[1px] bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-2xl md:col-span-1">
                                <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center justify-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>Resume / CV</label>
                                    <a href={profile.jobPreferences.resumeLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 border border-purple-500/30' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'}`}>
                                        <FileText className="w-4 h-4" /> View Professional Resume <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {profile.jobPreferences?.portfolioLink && (
                            <div className="p-[1px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl md:col-span-1">
                                <div className={`p-4 rounded-[calc(1rem-1px)] h-full flex flex-col items-center text-center justify-center ${darkMode ? 'bg-slate-800/80' : 'bg-[#FAFAFA]/80'}`}>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>Portfolio Website</label>
                                    <a href={profile.jobPreferences.portfolioLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition shadow-sm ${darkMode ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'}`}>
                                        <Globe className="w-4 h-4" /> Visit Portfolio <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
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
