import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, GraduationCap, Calendar, BookOpen, School, Award, Users, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import HybridInput from "../../ui/HybridInput";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYearForDropdown = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => currentYearForDropdown + 5 - i);

const DEGREE_SUGGESTIONS = [
    "High School (Secondary - Class 10)", 
    "Intermediate (Higher Secondary - Class 11-12)", 
    "Undergraduate (Bachelor's Degree)", 
    "Postgraduate (Master's Degree)", 
    "Diploma", 
    "Doctor of Philosophy (Ph.D)"
];

const COURSE_SUGGESTIONS = [
    "B.Tech", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc", "B.A", "M.A"
];
const BRANCH_SUGGESTIONS = [
    "Computer Science", "Information Technology", "Mechanical Engineering",
    "Civil Engineering", "Electronics and Communication", "Electrical Engineering",
    "Business Administration", "Finance", "Marketing", "HR", "Physics", "Maths"
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
    const { darkMode } = useTheme();
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedIndex, setExpandedIndex] = useState(0); // Default first one expanded

    const isEduComplete = (edu) => {
        return edu.institution && edu.degree && edu.startMonth && edu.startYear && edu.endMonth && edu.endYear;
    };

    useEffect(() => {
        if (isOpen) {
            const existingMap = (currentEducation || []).reduce((acc, edu) => {
                const key = edu.level || edu.degree;
                acc[key] = edu;
                return acc;
            }, {});

            const transformed = MANDATORY_DEGREES.map((levelName, idx) => {
                const edu = existingMap[levelName] || {};
                const [sMonth, sYear] = (edu.startDate || "").split(" ");
                const [eMonth, eYear] = (edu.endDate || "").split(" ");

                return {
                    ...edu,
                    level: levelName,
                    degree: edu.degree || levelName, 
                    course: edu.course || "",
                    branch: edu.branch || "",
                    startMonth: sMonth || "",
                    startYear: sYear || "",
                    endMonth: eMonth || "",
                    endYear: eYear || "",
                    institution: edu.institution || "",
                    campus: edu.campus || "",
                    grade: edu.grade || "",
                    activities: edu.activities || "",
                    description: edu.description || "",
                    isMandatory: true,
                    isFixed: true // All 4 mandatory levels (HS, Int, UG, PG) are fixed
                };
            });

            // Add non-mandatory educations
            (currentEducation || []).forEach(edu => {
                if (!MANDATORY_DEGREES.includes(edu.level || edu.degree)) {
                    const [sMonth, sYear] = (edu.startDate || "").split(" ");
                    const [eMonth, eYear] = (edu.endDate || "").split(" ");
                    transformed.push({
                        ...edu,
                        course: edu.course || "",
                        branch: edu.branch || "",
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
                course: "",
                branch: "",
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
            const hasData = edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description;
            if (hasData || !edu.isMandatory) {
                if (!edu.institution) newErrors[`${idx}-institution`] = "School is required";
                if (!edu.degree) newErrors[`${idx}-degree`] = "Degree is required";
                if (edu.degree && !edu.degree.includes("High School") && !edu.degree.includes("Intermediate") && !edu.course) {
                    newErrors[`${idx}-course`] = "Course is required";
                }
                if (!edu.startMonth || !edu.startYear) newErrors[`${idx}-startDate`] = "Start date required";
                if (!edu.endMonth || !edu.endYear) newErrors[`${idx}-endDate`] = "End date required";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields for the provided educations.");
            return;
        }

        setLoading(true);
        try {
            const validEducations = educations.filter(edu => 
                edu.institution || edu.course || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.grade || edu.activities || edu.description || !edu.isMandatory
            );

            const finalData = validEducations.map(edu => {
                const startDate = `${edu.startMonth} ${edu.startYear}`;
                const endDate = `${edu.endMonth} ${edu.endYear}`;

                return {
                    level: edu.level,
                    degree: edu.degree,
                    course: edu.course,
                    branch: edu.branch,
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4 animate-fadeIn">
            <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" /> Edit Education
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-[#FAFAFA]/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-[#121213]' : 'bg-gray-50/30'}`}>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>* Indicates required</p>

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
                        <div key={index} className={`border rounded-2xl relative shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-[#FAFAFA] border-gray-200'} ${expandedIndex === index ? 'ring-2 ring-blue-500/20 shadow-md' : 'hover:shadow-md'}`}>
                            {/* Header Section */}
                            <div
                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                className={`p-4 flex items-center justify-between cursor-pointer select-none rounded-t-2xl ${expandedIndex === index ? (darkMode ? 'bg-blue-900/10 border-b border-white/5' : 'bg-blue-50/50 border-b border-gray-100') : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-blue-500 transition-transform duration-300">
                                        {expandedIndex === index ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                    <h3 className={`font-black uppercase tracking-tight text-sm ${expandedIndex === index ? 'text-blue-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                        {edu.degree || "New Education Level"}
                                    </h3>
                                    {isEduComplete(edu) ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : edu.isMandatory ? (
                                        <Circle className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                    {edu.isFixed && expandedIndex !== index && (
                                        <span className="text-[10px] text-blue-500 font-bold uppercase mr-2">Mandatory</span>
                                    )}
                                    {edu.isMandatory && !edu.isFixed && expandedIndex !== index && (
                                        <span className="text-[10px] text-purple-500 font-bold uppercase mr-2">Required</span>
                                    )}
                                    {!edu.isMandatory && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeEducation(index);
                                            }}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-500/10 rounded-full transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className={`transition-all duration-300 overflow-hidden ${expandedIndex === index ? 'max-h-[1500px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="space-y-6">
                                    {/* School */}
                                    <div className="space-y-1.5">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-institution`] ? 'text-red-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                            School/College <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="school-list-final"
                                            className={`w-full p-2.5 border rounded-lg text-sm transition outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500/30'} ${errors[`${index}-institution`] ? 'border-red-500 focus:ring-red-200' : 'focus:ring-2'}`}
                                            value={edu.institution || ""}
                                            onChange={(e) => handleChange(index, "institution", e.target.value)}
                                            placeholder="Ex: Graphic Era Hill University"
                                        />
                                        {errors[`${index}-institution`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-institution`]}</p>}
                                    </div>

                                    {/* Campus logic for GEHU */}
                                    {edu.institution === "Graphic Era Hill University" && (
                                        <div className="space-y-1.5 animate-fadeIn">
                                            <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Campus</label>
                                            <select
                                                className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500'}`}
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
                                            <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-degree`] ? 'text-red-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                                Degree/Level <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <select
                                                value={edu.degree || ""}
                                                onChange={(e) => !edu.isFixed && handleChange(index, "degree", e.target.value)}
                                                disabled={edu.isFixed}
                                                className={`w-full p-2.5 border rounded-lg text-sm transition outline-none ${darkMode ? (edu.isFixed ? 'bg-[#121213] text-slate-500 border-slate-700' : 'bg-slate-800 text-white border-slate-700 focus:ring-blue-500/50') : (edu.isFixed ? 'bg-gray-50 text-gray-500 border-gray-300' : 'bg-[#FAFAFA] text-gray-900 border-gray-300 focus:ring-blue-500/30')} ${errors[`${index}-degree`] ? 'border-red-500 focus:ring-red-200' : 'focus:ring-2'}`}
                                            >
                                                <option value="">Select Level</option>
                                                {DEGREE_SUGGESTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            {edu.isFixed && <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Mandatory Level (Fixed)</p>}
                                            {errors[`${index}-degree`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-degree`]}</p>}
                                        </div>

                                        {!edu.degree?.includes("High School") && !edu.degree?.includes("Intermediate") && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-course`] ? 'text-red-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                                        Course <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <HybridInput
                                                        value={edu.course || ""}
                                                        onChange={(val) => handleChange(index, "course", val)}
                                                        options={COURSE_SUGGESTIONS}
                                                        placeholder="Ex: B.Tech, MCA, etc."
                                                        uppercase={true}
                                                        className={`p-2.5 border rounded-lg text-sm transition ${darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAFA] text-gray-900 border-gray-300'} ${errors[`${index}-course`] ? 'border-red-500' : ''}`}
                                                    />
                                                    {errors[`${index}-course`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-course`]}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                                        Branch
                                                    </label>
                                                    <HybridInput
                                                        value={edu.branch || ""}
                                                        onChange={(val) => handleChange(index, "branch", val)}
                                                        options={BRANCH_SUGGESTIONS}
                                                        placeholder="Ex: CS, IT, ME, etc."
                                                        uppercase={true}
                                                        className={`p-2.5 border rounded-lg text-sm transition ${darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAFA] text-gray-900 border-gray-300'}`}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Field of study</label>
                                            <input
                                                type="text"
                                                list="study-list"
                                                className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                                value={edu.fieldOfStudy || ""}
                                                onChange={(e) => handleChange(index, "fieldOfStudy", e.target.value)}
                                                placeholder="Ex: Computer Science"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-startDate`] ? 'text-red-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                                Start date <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    className={`w-full p-2 border rounded-lg text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#FAFAFA] border-gray-300 text-gray-900'}`}
                                                    value={edu.startMonth || ""}
                                                    onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                                >
                                                    <option value="">Month</option>
                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select
                                                    className={`w-full p-2 border rounded-lg text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#FAFAFA] border-gray-300 text-gray-900'}`}
                                                    value={edu.startYear || ""}
                                                    onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                                >
                                                    <option value="">Year</option>
                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-endDate`] ? 'text-red-500' : (darkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                                End date (or expected) <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    className={`w-full p-2 border rounded-lg text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#FAFAFA] border-gray-300 text-gray-900'}`}
                                                    value={edu.endMonth || ""}
                                                    onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                                >
                                                    <option value="">Month</option>
                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select
                                                    className={`w-full p-2 border rounded-lg text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#FAFAFA] border-gray-300 text-gray-900'}`}
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
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                            <Award className="w-3.5 h-3.5 text-yellow-500" />
                                            {edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Percentage" : "CGPA / Grade"}
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                            value={edu.grade || ""}
                                            onChange={(e) => handleChange(index, "grade", e.target.value)}
                                            placeholder={edu.degree?.includes("High School") || edu.degree?.includes("Intermediate") ? "Ex: 95%" : "Ex: 9.0 CGPA"}
                                        />
                                    </div>

                                    {/* Activities */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                                <Users className="w-3.5 h-3.5 text-blue-500" /> Activities and societies
                                            </label>
                                            <span className={`text-[10px] font-bold ${(edu.activities?.length || 0) > 450 ? 'text-red-500' : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                                                {edu.activities?.length || 0}/500
                                            </span>
                                        </div>
                                        <textarea
                                            className={`w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 transition h-20 custom-scrollbar ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                            value={edu.activities || ""}
                                            onChange={(e) => handleChange(index, "activities", e.target.value.slice(0, 500))}
                                            placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                                <BookOpen className="w-3.5 h-3.5 text-green-500" /> Description
                                            </label>
                                            <span className={`text-[10px] font-bold ${(edu.description?.length || 0) > 900 ? 'text-red-500' : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                                                {edu.description?.length || 0}/1000
                                            </span>
                                        </div>
                                        <textarea
                                            className={`w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 transition h-32 custom-scrollbar ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-[#FAFAFA] border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                            value={edu.description || ""}
                                            onChange={(e) => handleChange(index, "description", e.target.value.slice(0, 1000))}
                                            placeholder="Describe your studies, awards, or projects..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addEducation}
                        className={`w-full py-8 border-2 border-dashed rounded-2xl transition flex items-center justify-center gap-2 group font-bold tracking-wide ${darkMode ? 'border-slate-700 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-gray-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'}`}
                    >
                        <Plus className="w-6 h-6 group-hover:scale-110 transition" /> CLICK TO ADD NEW EDUCATION
                    </button>
                </div>

                {/* Footer */}
                <div className={`p-4 flex justify-end gap-3 border-t flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50'}`}>
                    <button onClick={onClose} className={`px-5 py-2.5 border rounded-xl transition font-semibold ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
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
                    background: ${darkMode ? '#334155' : '#d1d5db'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#475569' : '#9ca3af'};
                }
            `}</style>
        </div>
    );
}
