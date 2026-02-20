import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditEducationModal from "./modals/EditEducationModal";
import { GraduationCap, Calendar, BookOpen, School, Award, Users } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileEducation({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            education: updatedUser.education,
        }));
    };

    return (
        <>
            <SectionCard
                title="Education"
                hasData={profile.education?.length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                <div className="space-y-8">
                    {profile.education?.map((edu, idx) => (
                        <div key={idx} className="flex gap-4 group">
                            {/* Institution Icon */}
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-md flex items-center justify-center border transition-colors ${darkMode ? 'bg-slate-800 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                    <School className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-grow space-y-3">
                                <div className="flex flex-col">
                                    <h3 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {edu.institution}
                                        {edu.campus && <span className={`text-sm font-medium block md:inline md:ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>({edu.campus} Campus)</span>}
                                    </h3>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {edu.degree}
                                        {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                                    </p>
                                </div>

                                <div className={`text-xs font-medium space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <p className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {edu.startDate} - {edu.endDate}
                                    </p>
                                    {edu.grade && (
                                        <p className="flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5 text-yellow-600" />
                                            <span className="font-bold">
                                                {edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Percentage" : "Grade"}: {edu.grade}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {edu.activities && (
                                    <div className={`flex gap-2 p-2.5 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50/50 border-blue-100/50'}`}>
                                        <Users className={`w-4 h-4 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                                        <div>
                                            <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Activities and societies</p>
                                            <p className={`text-xs leading-relaxed italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {edu.activities}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {edu.description && (
                                    <div className="space-y-1">
                                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {edu.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(!profile.education || profile.education.length === 0) && (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No educational background added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditEducationModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentEducation={profile.education || []}
                onSave={handleSave}
            />
        </>
    );
}
