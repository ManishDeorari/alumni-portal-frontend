import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Briefcase, BarChart, Settings, Layers, Code } from "lucide-react";

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
        setWorkProfile(prev => ({ ...prev, [field]: value }));
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
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-gray-900">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Work Profile & Skills
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <datalist id="area-suggestions">
                        {FUNCTIONAL_AREAS.map(a => <option key={a} value={a} />)}
                    </datalist>
                    <datalist id="industry-suggestions">
                        {INDUSTRIES.map(i => <option key={i} value={i} />)}
                    </datalist>
                    <datalist id="exp-suggestions">
                        {EXPERIENCE_LEVELS.map(e => <option key={e} value={e} />)}
                    </datalist>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                <BarChart className="w-3.5 h-3.5" /> Functional Area
                            </label>
                            <input
                                type="text"
                                list="area-suggestions"
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={workProfile.functionalArea}
                                onChange={(e) => handleChange("functionalArea", e.target.value)}
                                placeholder="Ex: Software Engineering"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                <Settings className="w-3.5 h-3.5" /> Sub-Functional Area
                            </label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={workProfile.subFunctionalArea}
                                onChange={(e) => handleChange("subFunctionalArea", e.target.value)}
                                placeholder="Ex: Backend Development"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5" /> Experience
                                </label>
                                <input
                                    type="text"
                                    list="exp-suggestions"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={workProfile.experience}
                                    onChange={(e) => handleChange("experience", e.target.value)}
                                    placeholder="Ex: 1-3 Years"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <BarChart className="w-3.5 h-3.5" /> Industry
                                </label>
                                <input
                                    type="text"
                                    list="industry-suggestions"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={workProfile.industry}
                                    onChange={(e) => handleChange("industry", e.target.value)}
                                    placeholder="Ex: Fintech"
                                />
                            </div>
                        </div>

                        {/* Skills Field */}
                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                <Code className="w-3.5 h-3.5 text-blue-500" /> Key Skills (comma separated)
                            </label>
                            <textarea
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition h-20"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="Ex: React, Node.js, Python, Leadership"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
                    <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
