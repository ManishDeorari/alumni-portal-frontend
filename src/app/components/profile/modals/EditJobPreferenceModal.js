import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Heart, MapPin, Clock, DollarSign, FileText, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

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
        let processedValue = value;
        if (field === "functionalArea") {
            processedValue = processedValue.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
        } else if (field === "salary") {
            processedValue = processedValue.replace(/[^0-9\,\.\s[a-zA-Z]/g, '');
        } else if (field === "resumeLink" || field === "portfolioLink") {
            processedValue = processedValue.replace(/\s/g, '');
        }
        setPreferences(prev => ({ ...prev, [field]: processedValue }));
    };

    const handleLocationsChange = (value) => {
        let processedValue = value.replace(/[^a-zA-Z\s\-,]/g, '');
        setLocationsInput(processedValue);
        const locations = processedValue.split(",").map(lang => lang.trim()).filter(Boolean);
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
                        <Heart className="w-5 h-5" /> Job Preferences
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
