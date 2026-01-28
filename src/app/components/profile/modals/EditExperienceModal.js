import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Save, Briefcase, Calendar, MapPin } from "lucide-react";
import { Country, State, City } from "country-state-city";

const EMPLOYMENT_TYPES = [
    "Full-time",
    "Part-time",
    "Self-employed",
    "Freelance",
    "Internship",
    "Trainee",
];

const LOCATION_TYPES = ["On-site", "Remote", "Hybrid"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

// Common suggestions for Job Titles and Companies
const JOB_TITLE_SUGGESTIONS = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Product Manager", "Project Manager", "Data Scientist", "UI/UX Designer",
    "Sales Manager", "Marketing Executive", "Business Analyst", "Human Resources",
    "Operations Manager", "Assistant Scrum Master", "Scrum Master", "Junior Intern"
];

const COMPANY_SUGGESTIONS = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "OpenChift",
    "Adobe", "Salesforce", "IBM", "Oracle"
];

export default function EditExperienceModal({ isOpen, onClose, currentExperience, onSave }) {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (currentExperience && isOpen) {
            // Transform stored data into form state
            const transformed = currentExperience.map(exp => {
                const [sMonth, sYear] = (exp.startDate || "").split(" ");
                const isCurrent = exp.endDate === "Present";
                const [eMonth, eYear] = !isCurrent ? (exp.endDate || "").split(" ") : ["", ""];

                // Parse location for dropdowns
                let country = "", state = "", city = "";
                if (exp.location) {
                    const parts = exp.location.split(", ").map(p => p.trim());
                    if (parts.length === 3) {
                        const allCountries = Country.getAllCountries();
                        const foundCountry = allCountries.find(c => c.name === parts[2]);
                        if (foundCountry) {
                            country = foundCountry.isoCode;
                            const foundState = State.getStatesOfCountry(country).find(s => s.name === parts[1]);
                            if (foundState) {
                                state = foundState.isoCode;
                                const foundCity = City.getCitiesOfState(country, state).find(c => c.name === parts[0]);
                                if (foundCity) city = foundCity.name;
                            }
                        }
                    }
                }

                return {
                    ...exp,
                    startMonth: sMonth || "",
                    startYear: sYear || "",
                    isCurrent,
                    endMonth: eMonth || "",
                    endYear: eYear || "",
                    selectedCountry: country,
                    selectedState: state,
                    selectedCity: city,
                    skills: Array.isArray(exp.skills) ? exp.skills.join(", ") : (exp.skills || "")
                };
            });
            setExperiences(transformed);
        }
    }, [currentExperience, isOpen]);

    if (!isOpen) return null;

    const handleChange = (index, field, value) => {
        const updated = [...experiences];
        updated[index][field] = value;
        setExperiences(updated);

        // Clear errors
        if (errors[`${index}-${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${field}`];
            setErrors(newErrors);
        }
    };

    const addExperience = () => {
        setExperiences([
            ...experiences,
            {
                title: "",
                company: "",
                employmentType: "",
                locationType: "",
                selectedCountry: "",
                selectedState: "",
                selectedCity: "",
                startMonth: "",
                startYear: "",
                isCurrent: false,
                endMonth: "",
                endYear: "",
                description: "",
                skills: ""
            },
        ]);
    };

    const removeExperience = (index) => {
        setExperiences(experiences.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        experiences.forEach((exp, idx) => {
            if (!exp.title) newErrors[`${idx}-title`] = "Title is required";
            if (!exp.company) newErrors[`${idx}-company`] = "Company is required";
            if (!exp.startMonth || !exp.startYear) newErrors[`${idx}-startDate`] = "Start date required";
            if (!exp.isCurrent && (!exp.endMonth || !exp.endYear)) newErrors[`${idx}-endDate`] = "End date required";
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
            const finalData = experiences.map(exp => {
                // Construct date strings
                const startDate = `${exp.startMonth} ${exp.startYear}`;
                const endDate = exp.isCurrent ? "Present" : `${exp.endMonth} ${exp.endYear}`;

                // Construct location string
                let location = "";
                if (exp.selectedCountry && exp.selectedState && exp.selectedCity) {
                    const cName = Country.getCountryByCode(exp.selectedCountry)?.name;
                    const sName = State.getStateByCodeAndCountry(exp.selectedState, exp.selectedCountry)?.name;
                    location = `${exp.selectedCity}, ${sName}, ${cName}`;
                }

                return {
                    title: exp.title,
                    company: exp.company,
                    employmentType: exp.employmentType,
                    location: location,
                    locationType: exp.locationType,
                    startDate,
                    endDate,
                    description: exp.description,
                    skills: typeof exp.skills === 'string' ? exp.skills.split(",").map(s => s.trim()).filter(s => s !== "") : []
                };
            });

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ experience: finalData }),
            });

            if (!res.ok) throw new Error("Failed to update experience");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Experience updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating experience");
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
                        <Briefcase className="w-5 h-5" /> Edit Experience
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow bg-gray-50/30">
                    {/* Datalists for Suggestions */}
                    <datalist id="job-titles">
                        {JOB_TITLE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                    </datalist>
                    <datalist id="companies">
                        {COMPANY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                    </datalist>

                    {experiences.map((exp, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-2xl bg-white relative shadow-sm hover:shadow-md transition">
                            <button
                                onClick={() => removeExperience(index)}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                                title="Remove item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="space-y-6">
                                {/* Row 1: Title and Employment Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-title`] ? 'text-red-500' : 'text-gray-700'}`}>
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            list="job-titles"
                                            className={`w-full p-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 outline-none transition ${errors[`${index}-title`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                            value={exp.title || ""}
                                            onChange={(e) => handleChange(index, "title", e.target.value)}
                                            placeholder="Ex: Retail Sales Manager"
                                        />
                                        {errors[`${index}-title`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-title`]}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Employment type</label>
                                        <select
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={exp.employmentType || ""}
                                            onChange={(e) => handleChange(index, "employmentType", e.target.value)}
                                        >
                                            <option value="">Please select</option>
                                            {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2: Company */}
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-company`] ? 'text-red-500' : 'text-gray-700'}`}>
                                        Company or organization <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="companies"
                                        className={`w-full p-2.5 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 outline-none transition ${errors[`${index}-company`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                        value={exp.company || ""}
                                        onChange={(e) => handleChange(index, "company", e.target.value)}
                                        placeholder="Ex: Microsoft"
                                    />
                                    {errors[`${index}-company`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-company`]}</p>}
                                </div>

                                {/* Checkbox: Currently working */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={exp.isCurrent}
                                        onChange={(e) => handleChange(index, "isCurrent", e.target.checked)}
                                    />
                                    <label htmlFor={`current-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                        I am currently working in this role
                                    </label>
                                </div>

                                {/* Row 3: Start Date */}
                                <div className="space-y-2">
                                    <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-startDate`] ? 'text-red-500' : 'text-gray-700'}`}>
                                        Start date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                            value={exp.startMonth || ""}
                                            onChange={(e) => handleChange(index, "startMonth", e.target.value)}
                                        >
                                            <option value="">Month</option>
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                            value={exp.startYear || ""}
                                            onChange={(e) => handleChange(index, "startYear", e.target.value)}
                                        >
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {errors[`${index}-startDate`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-startDate`]}</p>}
                                </div>

                                {/* Row 4: End Date */}
                                {!exp.isCurrent && (
                                    <div className="space-y-2">
                                        <label className={`text-sm font-semibold flex items-center gap-1 ${errors[`${index}-endDate`] ? 'text-red-500' : 'text-gray-700'}`}>
                                            End date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                value={exp.endMonth || ""}
                                                onChange={(e) => handleChange(index, "endMonth", e.target.value)}
                                            >
                                                <option value="">Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                value={exp.endYear || ""}
                                                onChange={(e) => handleChange(index, "endYear", e.target.value)}
                                            >
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        {errors[`${index}-endDate`] && <p className="text-red-500 text-[10px] font-bold uppercase">{errors[`${index}-endDate`]}</p>}
                                    </div>
                                )}

                                {/* Row 5: Location Dropdowns */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                        Location <MapPin className="w-3.5 h-3.5 text-red-500" />
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <select
                                            value={exp.selectedCountry}
                                            onChange={(e) => {
                                                handleChange(index, "selectedCountry", e.target.value);
                                                handleChange(index, "selectedState", "");
                                                handleChange(index, "selectedCity", "");
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="" className="text-gray-900">Select Country</option>
                                            {Country.getAllCountries().map((c) => (
                                                <option key={c.isoCode} value={c.isoCode} className="text-gray-900">{c.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={exp.selectedState}
                                            disabled={!exp.selectedCountry}
                                            onChange={(e) => {
                                                handleChange(index, "selectedState", e.target.value);
                                                handleChange(index, "selectedCity", "");
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                        >
                                            <option value="" className="text-gray-900">Select State</option>
                                            {exp.selectedCountry && State.getStatesOfCountry(exp.selectedCountry).map((s) => (
                                                <option key={s.isoCode} value={s.isoCode} className="text-gray-900">{s.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={exp.selectedCity}
                                            disabled={!exp.selectedState}
                                            onChange={(e) => handleChange(index, "selectedCity", e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                        >
                                            <option value="" className="text-gray-900">Select City</option>
                                            {exp.selectedState && City.getCitiesOfState(exp.selectedCountry, exp.selectedState).map((city) => (
                                                <option key={city.name} value={city.name} className="text-gray-900">{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 6: Location Type */}
                                <div className="space-y-1.5 md:w-1/2">
                                    <label className="text-sm font-semibold text-gray-700">Location type</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={exp.locationType || ""}
                                        onChange={(e) => handleChange(index, "locationType", e.target.value)}
                                    >
                                        <option value="" className="text-gray-900">Please select</option>
                                        {LOCATION_TYPES.map(type => <option key={type} value={type} className="text-gray-900">{type}</option>)}
                                    </select>
                                </div>

                                {/* Row 7: Description */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Description</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition h-32 custom-scrollbar"
                                        value={exp.description || ""}
                                        onChange={(e) => handleChange(index, "description", e.target.value)}
                                        placeholder="Describe your achievements..."
                                    />
                                </div>

                                {/* Row 8: Skills */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Skills (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={exp.skills || ""}
                                        onChange={(e) => handleChange(index, "skills", e.target.value)}
                                        placeholder="Agile, React, Management (comma separated)"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addExperience}
                        className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center gap-2 group font-bold tracking-wide"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition" /> CLICK TO ADD NEW EXPERIENCE
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
