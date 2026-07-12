







import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
        setWorkProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ workProfile, skills: skillsArray })
            });
            
            const data = await res.json();
            if (res.ok) {
                toast.success("Work Profile saved successfully!");
                onSave(data.user);
                onClose();
            } else {
                toast.error(data.message || "Failed to save.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-xl p-6 rounded-2xl shadow-2xl relative ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition ${darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                >
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-6">Edit Work Profile & Skills</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-sm font-medium mb-1">Industry</label>
                        <input
                            type="text"
                            value={workProfile.industry}
                            onChange={e => handleChange("industry", e.target.value)}
                            placeholder="e.g. Information Technology"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Functional Area</label>
                        <input
                            type="text"
                            value={workProfile.functionalArea}
                            onChange={e => handleChange("functionalArea", e.target.value)}
                            placeholder="e.g. Software Engineering"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sub-functional Area</label>
                        <input
                            type="text"
                            value={workProfile.subFunctionalArea}
                            onChange={e => handleChange("subFunctionalArea", e.target.value)}
                            placeholder="e.g. Frontend Development"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Total Experience</label>
                        <input
                            type="text"
                            value={workProfile.experience}
                            onChange={e => handleChange("experience", e.target.value)}
                            placeholder="e.g. 5 Years"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Top Skills (comma separated)</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            placeholder="e.g. React, Node.js, Python"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-xl font-medium ${darkMode ? "bg-slate-800 text-white" : "bg-gray-100 text-slate-700"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveClick}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}