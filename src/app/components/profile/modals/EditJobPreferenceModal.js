







import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function EditJobPreferenceModal({ isOpen, onClose, currentPreferences, onSave }) {
    const { darkMode } = useTheme();
    const [preferences, setPreferences] = useState({
        functionalArea: "",
        preferredLocations: [],
        noticePeriod: "",
        salary: "",
        resumeLink: "",
        portfolioLink: ""
    });
    const [locationsInput, setLocationsInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentPreferences && isOpen) {
            setPreferences({
                functionalArea: currentPreferences.functionalArea || "",
                preferredLocations: currentPreferences.preferredLocations || [],
                noticePeriod: currentPreferences.noticePeriod || "",
                salary: currentPreferences.salary || "",
                resumeLink: currentPreferences.resumeLink || "",
                portfolioLink: currentPreferences.portfolioLink || ""
            });
            setLocationsInput((currentPreferences.preferredLocations || []).join(", "));
        }
    }, [currentPreferences, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationsChange = (value) => {
        setLocationsInput(value);
        const locations = value.split(",").map(lang => lang.trim()).filter(Boolean);
        setPreferences(prev => ({ ...prev, preferredLocations: locations }));
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ jobPreferences: preferences })
            });
            
            const data = await res.json();
            if (res.ok) {
                toast.success("Job Preferences saved successfully!");
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
                <h2 className="text-xl font-bold mb-6">Edit Job Preferences</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-sm font-medium mb-1">Functional Area</label>
                        <input
                            type="text"
                            value={preferences.functionalArea}
                            onChange={e => handleChange("functionalArea", e.target.value)}
                            placeholder="e.g. Software Engineering"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Preferred Locations (comma separated)</label>
                        <input
                            type="text"
                            value={locationsInput}
                            onChange={e => handleLocationsChange(e.target.value)}
                            placeholder="e.g. Bangalore, Remote"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notice Period</label>
                        <input
                            type="text"
                            value={preferences.noticePeriod}
                            onChange={e => handleChange("noticePeriod", e.target.value)}
                            placeholder="e.g. 30 Days"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Salary Expectations</label>
                        <input
                            type="text"
                            value={preferences.salary}
                            onChange={e => handleChange("salary", e.target.value)}
                            placeholder="e.g. $100k"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Resume Link</label>
                        <input
                            type="text"
                            value={preferences.resumeLink}
                            onChange={e => handleChange("resumeLink", e.target.value)}
                            placeholder="URL to your resume"
                            className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"} outline-none`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Portfolio Link</label>
                        <input
                            type="text"
                            value={preferences.portfolioLink}
                            onChange={e => handleChange("portfolioLink", e.target.value)}
                            placeholder="URL to your portfolio"
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
