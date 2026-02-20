import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Heart, MapPin, Clock, DollarSign, FileText, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const NOTICE_PERIODS = [
    "Immediate", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"
];

const SALARY_RANGES = [
    "< 3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-25 LPA", "25-50 LPA", "50+ LPA"
];

const FUNCTIONAL_AREAS = [
    "Software Engineering", "Frontend Development", "Backend Development", "Full Stack Development",
    "Data Science", "Machine Learning", "Mobile App Development", "UI/UX Design",
    "Product Management", "Project Management", "Marketing", "Sales",
    "Human Resources", "Finance", "Operations", "Quality Assurance"
];

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

    const isValidUrl = (string) => {
        if (!string) return true;
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSave = async () => {
        if (!isValidUrl(preferences.resumeLink)) {
            return toast.error("Please enter a valid Resume URL (with http:// or https://)");
        }
        if (!isValidUrl(preferences.portfolioLink)) {
            return toast.error("Please enter a valid Portfolio URL (with http:// or https://)");
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ jobPreferences: preferences }),
            });

            if (!res.ok) throw new Error("Failed to update job preferences");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Job Preferences updated!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating job preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className={`${darkMode ? 'bg-slate-900 border border-white/5' : 'bg-white'} rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Heart className="w-5 h-5" /> Job Preferences
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <datalist id="pref-area-suggestions">
                        {FUNCTIONAL_AREAS.map(a => <option key={a} value={a} />)}
                    </datalist>
                    <datalist id="notice-suggestions">
                        {NOTICE_PERIODS.map(n => <option key={n} value={n} />)}
                    </datalist>
                    <datalist id="salary-suggestions">
                        {SALARY_RANGES.map(s => <option key={s} value={s} />)}
                    </datalist>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <Heart className="w-3.5 h-3.5 text-blue-500" /> Preferred Functional Area
                            </label>
                            <input
                                type="text"
                                list="pref-area-suggestions"
                                className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                value={preferences.functionalArea}
                                onChange={(e) => handleChange("functionalArea", e.target.value)}
                                placeholder="Ex: Full Stack Development"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <MapPin className="w-3.5 h-3.5 text-red-500" /> Preferred Locations
                            </label>
                            <input
                                type="text"
                                className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                value={locationsInput}
                                onChange={(e) => handleLocationsChange(e.target.value)}
                                placeholder="Ex: Dehradun, Delhi, Bangalore"
                            />
                            <p className={`text-[10px] font-medium tracking-wide mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>SEPARATE WITH COMMAS (,)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    <Clock className="w-3.5 h-3.5 text-orange-500" /> Notice Period
                                </label>
                                <input
                                    type="text"
                                    list="notice-suggestions"
                                    className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                    value={preferences.noticePeriod}
                                    onChange={(e) => handleChange("noticePeriod", e.target.value)}
                                    placeholder="Ex: 30 Days"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    <DollarSign className="w-3.5 h-3.5 text-green-500" /> Expected Salary
                                </label>
                                <input
                                    type="text"
                                    list="salary-suggestions"
                                    className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                    value={preferences.salary}
                                    onChange={(e) => handleChange("salary", e.target.value)}
                                    placeholder="Ex: 6-10 LPA"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    <FileText className="w-3.5 h-3.5 text-purple-500" /> Resume Link
                                </label>
                                <input
                                    type="url"
                                    className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                    value={preferences.resumeLink}
                                    onChange={(e) => handleChange("resumeLink", e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    <Globe className="w-3.5 h-3.5 text-blue-400" /> Portfolio Link
                                </label>
                                <input
                                    type="url"
                                    className={`w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                                    value={preferences.portfolioLink}
                                    onChange={(e) => handleChange("portfolioLink", e.target.value)}
                                    placeholder="https://myportfolio.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 flex justify-end gap-3 border-t flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50'}`}>
                    <button
                        onClick={onClose}
                        className={`px-5 py-2.5 border rounded-xl transition font-semibold ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
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
