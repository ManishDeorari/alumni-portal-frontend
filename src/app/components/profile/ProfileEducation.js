"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditEducationModal from "./modals/EditEducationModal";
import { GraduationCap, Calendar, BookOpen, School, Award, Users } from "lucide-react";

export default function ProfileEducation({ profile, setProfile, isPublicView }) {
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
                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                    <School className="w-6 h-6 text-gray-400" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-grow space-y-3">
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                                        {edu.institution}
                                        {edu.campus && <span className="text-sm font-medium text-blue-600 block md:inline md:ml-2">({edu.campus} Campus)</span>}
                                    </h3>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {edu.degree}
                                        {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                                    </p>
                                </div>

                                <div className="text-xs text-gray-500 font-medium space-y-1">
                                    <p className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {edu.startDate} - {edu.endDate}
                                    </p>
                                    {edu.grade && (
                                        <p className="flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5 text-yellow-600" />
                                            <span className="font-bold">Grade: {edu.grade}</span>
                                        </p>
                                    )}
                                </div>

                                {edu.activities && (
                                    <div className="flex gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                                        <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Activities and societies</p>
                                            <p className="text-xs text-gray-600 leading-relaxed italic">
                                                {edu.activities}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {edu.description && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                            {edu.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(!profile.education || profile.education.length === 0) && (
                    <div className="py-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No educational background added yet.</p>
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
