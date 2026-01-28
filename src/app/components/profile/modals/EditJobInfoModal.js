import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function EditJobInfoModal({ isOpen, onClose, currentProfile, onSave }) {
    const [workProfile, setWorkProfile] = useState({});
    const [jobPreferences, setJobPreferences] = useState({});
    const [skills, setSkills] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProfile) {
            setWorkProfile(currentProfile.workProfile || {});
            setJobPreferences(currentProfile.jobPreferences || {});
            setSkills(currentProfile.skills ? currentProfile.skills.join(", ") : "");
        }
    }, [currentProfile]);

    if (!isOpen) return null;

    const handleWorkChange = (field, value) => {
        setWorkProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleJobChange = (field, value) => {
        setJobPreferences((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocationsChange = (value) => {
        // Split by comma and clean up whitespace
        const locations = value.split(",").map((loc) => loc.trim());
        setJobPreferences((prev) => ({ ...prev, preferredLocations: locations }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

            const updateData = {
                workProfile,
                jobPreferences,
                skills: skillsArray,
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) throw new Error("Failed to update job info");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Job Info updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating job info");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg relative my-10">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">Edit Job Info & Skills</h2>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Work Profile Section */}
                    <div className="border p-4 rounded bg-gray-50">
                        <h3 className="font-semibold mb-3 text-blue-700">Current Work Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Functional Area</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={workProfile.functionalArea || ""}
                                    onChange={(e) => handleWorkChange("functionalArea", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Sub-Functional Area</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={workProfile.subFunctionalArea || ""}
                                    onChange={(e) => handleWorkChange("subFunctionalArea", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Experience</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={workProfile.experience || ""}
                                    onChange={(e) => handleWorkChange("experience", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Industry</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={workProfile.industry || ""}
                                    onChange={(e) => handleWorkChange("industry", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="border p-4 rounded bg-gray-50">
                        <h3 className="font-semibold mb-3 text-blue-700">Skills</h3>
                        <div>
                            <label className="text-xs text-gray-500">Skills (comma separated)</label>
                            <input
                                type="text"
                                placeholder="Java, Python, Leadership, etc."
                                className="w-full p-2 border rounded text-sm bg-white"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Preferences Section */}
                    <div className="border p-4 rounded bg-gray-50">
                        <h3 className="font-semibold mb-3 text-blue-700">Job Preferences</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Preferred Functional Area</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={jobPreferences.functionalArea || ""}
                                    onChange={(e) => handleJobChange("functionalArea", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Preferred Locations (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={jobPreferences.preferredLocations ? jobPreferences.preferredLocations.join(", ") : ""}
                                    onChange={(e) => handleLocationsChange(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Notice Period</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={jobPreferences.noticePeriod || ""}
                                    onChange={(e) => handleJobChange("noticePeriod", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Expected Salary</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={jobPreferences.salary || ""}
                                    onChange={(e) => handleJobChange("salary", e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Resume Link</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm bg-white"
                                    value={jobPreferences.resumeLink || ""}
                                    onChange={(e) => handleJobChange("resumeLink", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
