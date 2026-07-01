import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

const FUNCTIONAL_AREAS = [
    "Software Engineering", "Frontend Development", "Backend Development", "Full Stack Development",
    "Data Science", "Machine Learning", "Mobile App Development", "UI/UX Design",
    "Product Management", "Project Management", "Marketing", "Sales",
    "Human Resources", "Finance", "Operations", "Quality Assurance"
];

const INDUSTRIES = [
    "IT Services", "E-commerce", "Fintech", "Healthtech", "Edtech",
    "Automotive", "Banking", "Telecommunications", "Manufacturing", "Real Estate"
];

const EXPERIENCE_LEVELS = [
    "Fresher", "0-1 Year", "1-3 Years", "3-5 Years", "5-7 Years", "7-10 Years", "10+ Years"
];

export default function EditWorkProfileModal({ isOpen, onClose, currentWorkProfile, currentSkills, onSave }) {
    const { darkMode } = useTheme();
    const [workProfile, setWorkProfile] = useState({
        functionalArea: "",
        subFunctionalArea: "",
        experience: "",
        industry: ""
    });
    const [skills, setSkills] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWorkProfile({
                functionalArea: currentWorkProfile?.functionalArea || "",
                subFunctionalArea: currentWorkProfile?.subFunctionalArea || "",
                experience: currentWorkProfile?.experience || "",
                industry: currentWorkProfile?.industry || ""
            });
            setSkills(Array.isArray(currentSkills) ? currentSkills.join(", ") : "");
        }
    }, [currentWorkProfile, currentSkills, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        let processedValue = value;
        if (field === "experience") {
            processedValue = processedValue.replace(/[^0-9\.]/g, '');
        } else if (field === "industry" || field === "functionalArea" || field === "subFunctionalArea") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
        }
        setWorkProfile(prev => ({ ...prev, [field]: processedValue }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workProfile,
                    skills: skillsArray
                }),
            });

            if (!res.ok) throw new Error("Failed to update work profile");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Work Profile & Skills updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating work profile");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    return (
        <>
        <LoadingOverlay isVisible={loading} />
        <div className="fixed inset-0 h-[100dvh] w-full bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh]">
                <div className={`${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} rounded-[calc(2.5rem-2.5px)] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Work Profile & Skills
                    </h2>
                    
                    <div className="flex items-center">
<button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
<button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1 border-2 border-white rounded-xl transition ml-3"
                    >
                        <X className="w-5 h-5" />
                    </button>
</div>
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
        </div>
        </>
    );
}
