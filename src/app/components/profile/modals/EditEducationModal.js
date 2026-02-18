import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, GraduationCap, Calendar, BookOpen, School, Award, Users } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 5 - i);

const DEGREE_SUGGESTIONS = [
    "Bachelor of Technology (B.Tech)", "Bachelor of Science (B.Sc)", "Bachelor of Arts (B.A)",
    "Master of Technology (M.Tech)", "Master of Science (M.Sc)", "Master of Business Administration (MBA)",
    "Master of Computer Applications - MCA", "Doctor of Philosophy (Ph.D)", "High School Diploma"
];

const STUDY_SUGGESTIONS = [
    "Computer Science", "Information Technology", "Mechanical Engineering",
    "Civil Engineering", "Electronics and Communication", "Business Administration",
    "Physics", "Mathematics", "Biology", "Psychology"
];

const INSTITUTION_SUGGESTIONS = [
    "Graphic Era Deemed to be University",
    "Graphic Era Hill University",
    "Indian Institute of Technology (IIT)",
    "National Institute of Technology (NIT)",
    "BITS Pilani",
    "Delhi University",
    "Amity University"
];

const GEHU_CAMPUSES = ["Dehradun", "Bhimtal", "Haldwani"];

const MANDATORY_DEGREES = [
    "High School (Secondary - Class 10)",
    "Intermediate (Higher Secondary - Class 11-12)",
    "Undergraduate (Bachelor's Degree)",
    "Postgraduate (Master's Degree)"
];

export default function EditEducationModal({ isOpen, onClose, currentEducation, onSave }) {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            const existingMap = (currentEducation || []).reduce((acc, edu) => {
                acc[edu.degree] = edu;
                return acc;
            }, {});

            const transformed = MANDATORY_DEGREES.map(degree => {
                const edu = existingMap[degree] || {};
                const [sMonth, sYear] = (edu.startDate || "").split(" ");
                const [eMonth, eYear] = (edu.endDate || "").split(" ");

                return {
                    ...edu,
                    degree, // Ensure it matches exactly
                    startMonth: sMonth || "",
                    startYear: sYear || "",
                    endMonth: eMonth || "",
                    endYear: eYear || "",
                    institution: edu.institution || "",
                    campus: edu.campus || "",
                    grade: edu.grade || "",
                    activities: edu.activities || "",
                    description: edu.description || "",
                    isMandatory: true
                };
            });

            // Add non-mandatory educations
            (currentEducation || []).forEach(edu => {
                if (!MANDATORY_DEGREES.includes(edu.degree)) {
                    const [sMonth, sYear] = (edu.startDate || "").split(" ");
                    const [eMonth, eYear] = (edu.endDate || "").split(" ");
                    transformed.push({
                        ...edu,
                        startMonth: sMonth || "",
                        startYear: sYear || "",
                        endMonth: eMonth || "",
                        endYear: eYear || "",
                        isMandatory: false
                    });
                }
            });

            setEducations(transformed);
        }
    }, [currentEducation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (index, field, value) => {
        const updated = [...educations];
        updated[index][field] = value;
        setEducations(updated);

        if (errors[`${index}-${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${field}`];
            setErrors(newErrors);
        }
    };

    const addEducation = () => {
        setEducations([
            ...educations,
            {
                degree: "",
                fieldOfStudy: "",
                institution: "",
                campus: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                grade: "",
                activities: "",
                description: "",
                isMandatory: false
            },
        ]);
    };

    const removeEducation = (index) => {
        setEducations(educations.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        educations.forEach((edu, idx) => {
            if (!edu.institution) newErrors[`${idx}-institution`] = "School is required";
            if (!edu.degree) newErrors[`${idx}-degree`] = "Degree is required";
            if (!edu.startMonth || !edu.startYear) newErrors[`${idx}-startDate`] = "Start date required";
            if (!edu.endMonth || !edu.endYear) newErrors[`${idx}-endDate`] = "End date required";
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const finalData = educations.map(edu => {
                const startDate = `${edu.startMonth} ${edu.startYear}`;
                const endDate = `${edu.endMonth} ${edu.endYear}`;

                return {
                    degree: edu.degree,
                    fieldOfStudy: edu.fieldOfStudy,
                    institution: edu.institution,
                    campus: edu.institution === "Graphic Era Hill University" ? edu.campus : "",
                    location: "", // Explicitly clearing location
                    startDate,
                    endDate,
                    grade: edu.grade,
                    activities: edu.activities,
                    description: edu.description
                };
            });

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ education: finalData }),
            });

            if (!res.ok) throw new Error("Failed to update education");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Education details updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating education");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 text-gray-900">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" /> Edit Education
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow bg-gray-50/30">
                    <p className="text-xs text-gray-500 font-medium">* Indicates required</p>

                    <datalist id="degree-list-final">
                        {DEGREE_SUGGESTIONS.map(d => <option key={d} value={d} />)}
                    </datalist>
                    <datalist id="school-list-final">
                        {INSTITUTION_SUGGESTIONS.map(i => <option key={i} value={i} />)}
                    </datalist>
                    <datalist id="study-list">
                        {STUDY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                    </datalist>

                    {educations.map((edu, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-2xl bg-white relative shadow-sm hover:shadow-md transition">
                            {!edu.isMandatory && (
                                <button
                                    onClick={() => removeEducation(index)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <div className="space-y-6">
                                {/* School */}
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-institution`] ? 'text-red-500' : 'text-gray-700'}`}>
                                        School/College <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="school-list-final"
                                        className={`w-full p-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 outline-none transition ${errors[`${index}-institution`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                        value={edu.institution || ""}
                                        onChange={(e) => handleChange(index, "institution", e.target.value)}
                                        placeholder="Ex: Graphic Era Hill University"
                                    />
                                    {errors[`${index}-institution`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-institution`]}</p>}
                                </div>

                                {/* Campus logic for GEHU */}
                                {edu.institution === "Graphic Era Hill University" && (
                                    <div className="space-y-1.5 animate-fadeIn">
                                        <label className="text-sm font-semibold text-gray-700">Campus</label>
                                        <select
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={edu.campus || ""}
                                            onChange={(e) => handleChange(index, "campus", e.target.value)}
                                        >
                                            <option value="">Select Campus</option>
                                            {GEHU_CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-degree`] ? 'text-red-500' : 'text-gray-700'}`}>
                                            Degree <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="degree-list-final"
                                            className={`w-full p-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 outline-none transition ${errors[`${index}-degree`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'} ${edu.isMandatory ? 'opacity-70 bg-gray-50 cursor-not-allowed' : ''}`}
                                            value={edu.degree || ""}
                                            onChange={(e) => !edu.isMandatory && handleChange(index, "degree", e.target.value)}
                                            placeholder="Ex: Master of Computer Applications - MCA"
                                            readOnly={edu.isMandatory}
                                        />
                                        {edu.isMandatory && <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Mandatory Level (Fixed)</p>}
                                        {errors[`${index}-degree`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-degree`]}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Field of study</label>
                                        <input
                                            type="text"
                                            list="study-list"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={edu.fieldOfStudy || ""}
                                            onChange={(e) => handleChange(index, "fieldOfStudy", e.target.value)}
                                            placeholder="Ex: Computer Science"
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-startDate`] ? 'text-red-500' : 'text-gray-700'}`}>
                                            Start date <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                                value={edu.startMonth || ""}
                                                onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                            >
                                                <option value="">Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                                value={edu.startYear || ""}
                                                onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                            >
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-endDate`] ? 'text-red-500' : 'text-gray-700'}`}>
                                            End date (or expected) <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                                value={edu.endMonth || ""}
                                                onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                            >
                                                <option value="">Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                                value={edu.endYear || ""}
                                                onChange={(e) => handleChange(index, "endYear", e.target.value)}
                                            >
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Grade */}
                                <div className="space-y-1.5 md:w-1/2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                                        {edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Percentage" : "CGPA / Grade"}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={edu.grade || ""}
                                        onChange={(e) => handleChange(index, "grade", e.target.value)}
                                        placeholder={edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Ex: 95%" : "Ex: 9.0 CGPA"}
                                    />
                                </div>

                                {/* Activities */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-blue-500" /> Activities and societies
                                        </label>
                                        <span className={`text-[10px] font-bold ${(edu.activities?.length || 0) > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {edu.activities?.length || 0}/500
                                        </span>
                                    </div>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition h-20 custom-scrollbar"
                                        value={edu.activities || ""}
                                        onChange={(e) => handleChange(index, "activities", e.target.value.slice(0, 500))}
                                        placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-green-500" /> Description
                                        </label>
                                        <span className={`text-[10px] font-bold ${(edu.description?.length || 0) > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {edu.description?.length || 0}/1000
                                        </span>
                                    </div>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition h-32 custom-scrollbar"
                                        value={edu.description || ""}
                                        onChange={(e) => handleChange(index, "description", e.target.value.slice(0, 1000))}
                                        placeholder="Describe your studies, awards, or projects..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addEducation}
                        className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center gap-2 group font-bold tracking-wide"
                    >
                        <Plus className="w-6 h-6 group-hover:scale-110 transition" /> CLICK TO ADD NEW EDUCATION
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
}
