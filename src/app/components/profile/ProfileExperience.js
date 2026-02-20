import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditExperienceModal from "./modals/EditExperienceModal";
import { Briefcase, MapPin, Calendar, ExternalLink, Building2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileExperience({ profile, setProfile, isPublicView }) {
    const { darkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            experience: updatedUser.experience,
        }));
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate) return "";
        const start = new Date(startDate);
        const end = endDate === "Present" ? new Date() : new Date(endDate);

        if (isNaN(start.getTime())) return "";

        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (months < 0) return "";

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let result = "";
        if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
        if (remainingMonths > 0) result += `${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`;

        return result.trim();
    };

    return (
        <>
            <SectionCard
                title="Experience"
                hasData={profile.experience?.length > 0}
                onEdit={() => setIsEditing(true)}
                isPublicView={isPublicView}
            >
                <div className="space-y-8">
                    {profile.experience?.map((exp, idx) => {
                        const duration = calculateDuration(exp.startDate, exp.endDate);

                        return (
                            <div key={idx} className="flex gap-4 group">
                                {/* Logo Placeholder */}
                                <div className="flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center border transition-colors ${darkMode ? 'bg-slate-800 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                        <Building2 className={`w-6 h-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow space-y-2">
                                    <div className="flex flex-col">
                                        <h3 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {exp.title}
                                        </h3>
                                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {exp.company}
                                            {exp.employmentType && ` · ${exp.employmentType}`}
                                        </p>
                                    </div>

                                    <div className={`text-xs font-medium space-y-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <p className="flex items-center gap-1">
                                            {exp.startDate} - {exp.endDate}
                                            {duration && ` · ${duration}`}
                                        </p>
                                        {(exp.location || exp.locationType) && (
                                            <p className="flex items-center gap-1">
                                                {exp.location}
                                                {exp.location && exp.locationType && " · "}
                                                {exp.locationType}
                                            </p>
                                        )}
                                    </div>

                                    {exp.description && (
                                        <p className={`text-sm mt-2 whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {exp.description}
                                        </p>
                                    )}

                                    {exp.skills && exp.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 pt-2">
                                            <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills:</span>
                                            {exp.skills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className={`text-xs px-2 py-0.5 rounded-full border ${darkMode ? 'bg-slate-800 text-gray-400 border-white/10' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(!profile.experience || profile.experience.length === 0) && (
                    <div className={`py-6 text-center rounded-lg border-2 border-dashed ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <Briefcase className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No professional experience added yet.</p>
                    </div>
                )}
            </SectionCard>

            <EditExperienceModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentExperience={profile.experience || []}
                onSave={handleSave}
            />
        </>
    );
}
