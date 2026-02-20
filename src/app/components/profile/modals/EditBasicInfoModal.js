import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Phone, MapPin, Globe, Linkedin, MessageCircle, User } from "lucide-react";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTheme } from "@/context/ThemeContext";

export default function EditBasicInfoModal({ isOpen, onClose, currentProfile, onSave }) {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: "",
        phone: "", // Will store the full phone number from PhoneInput
        whatsapp: "",
        linkedin: "",
    });

    // Address structure
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (currentProfile && isOpen) {
            setFormData({
                name: currentProfile.name || "",
                phone: currentProfile.phone || "",
                whatsapp: currentProfile.whatsapp || "",
                linkedin: currentProfile.linkedin || "",
            });

            // Parse existing address (expected format: "City, State, Country")
            if (currentProfile.address) {
                const parts = currentProfile.address.split(",").map(p => p.trim());
                if (parts.length === 3) {
                    const countries = Country.getAllCountries();
                    const c = countries.find(item => item.name === parts[2]);
                    if (c) {
                        setSelectedCountry(c.isoCode);
                        const states = State.getStatesOfCountry(c.isoCode);
                        const s = states.find(item => item.name === parts[1]);
                        if (s) {
                            setSelectedState(s.isoCode);
                            const cities = City.getCitiesOfState(c.isoCode, s.isoCode);
                            const city = cities.find(item => item.name === parts[0]);
                            if (city) setSelectedCity(city.name);
                        }
                    }
                }
            } else {
                // Reset address fields if no address
                setSelectedCountry("");
                setSelectedState("");
                setSelectedCity("");
            }
        }
    }, [currentProfile, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phone: value }));
        if (errors.phone) {
            setErrors((prev) => ({ ...prev, phone: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        const WHATSAPP_REGEX = /^\d{7,15}$/;
        const URL_REGEX = /^(https?:\/\/)?([\w\d]+\.)?[\w\d]+\.\w+\/.*$/;

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (formData.phone && formData.phone.length < 7) {
            newErrors.phone = "Invalid phone number.";
        }

        if (formData.whatsapp && !WHATSAPP_REGEX.test(formData.whatsapp.replace(/\D/g, ""))) {
            newErrors.whatsapp = "Invalid WhatsApp number (digits only).";
        }

        if (formData.linkedin && !formData.linkedin.includes("linkedin.com")) {
            newErrors.linkedin = "Please enter a valid LinkedIn profile URL.";
        }
        else if (formData.linkedin && !URL_REGEX.test(formData.linkedin)) {
            newErrors.linkedin = "Invalid URL format.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fix errors before saving.");
            return;
        }

        setLoading(true);
        try {
            // Construct address string: "City, State, Country"
            let fullAddress = "";
            if (selectedCountry && selectedState && selectedCity) {
                const cName = Country.getCountryByCode(selectedCountry)?.name;
                const sName = State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name;
                fullAddress = `${selectedCity}, ${sName}, ${cName}`;
            }

            const payload = {
                ...formData,
                // Ensure phone starts with + if it's from PhoneInput
                phone: formData.phone.startsWith("+") ? formData.phone : `+${formData.phone}`,
                address: fullAddress
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update profile info");

            const updatedUser = await res.json();
            onSave(updatedUser);
            toast.success("Profile details updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating profile details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User className="w-5 h-5" /> Edit Personal Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-6 space-y-5 overflow-y-auto custom-scrollbar flex-grow ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    {/* Name */}
                    <div>
                        <label className={`block text-sm font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <User className="w-4 h-4 text-purple-500" /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className={`w-full p-2.5 border rounded-lg outline-none transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'} ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="phone-input-container">
                        <label className={`block text-sm font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <Phone className="w-4 h-4 text-blue-500" /> Phone Number
                        </label>
                        <PhoneInput
                            country={"in"}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            inputStyle={{
                                width: "100%",
                                height: "42px",
                                borderRadius: "8px",
                                border: errors.phone ? "1px solid #ef4444" : (darkMode ? "1px solid #334155" : "1px solid #d1d5db"),
                                fontSize: "14px",
                                backgroundColor: darkMode ? "#1e293b" : "#fff",
                                color: darkMode ? "#fff" : "#111827",
                            }}
                            buttonStyle={{
                                borderRadius: "8px 0 0 8px",
                                border: errors.phone ? "1px solid #ef4444" : (darkMode ? "1px solid #334155" : "1px solid #d1d5db"),
                                backgroundColor: darkMode ? "#1e293b" : "#f9fafb",
                            }}
                            dropdownStyle={{
                                backgroundColor: darkMode ? "#1e293b" : "#fff",
                                color: darkMode ? "#fff" : "#111827",
                            }}
                            containerStyle={{
                                marginTop: "4px",
                            }}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Address Dropdowns */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <MapPin className="w-4 h-4 text-red-500" /> Location (Address)
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {/* Country */}
                            <select
                                value={selectedCountry}
                                onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setSelectedState("");
                                    setSelectedCity("");
                                }}
                                className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-2 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                            >
                                <option value="">Select Country</option>
                                {Country.getAllCountries().map((c) => (
                                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                ))}
                            </select>

                            {/* State */}
                            <select
                                value={selectedState}
                                disabled={!selectedCountry}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedCity("");
                                }}
                                className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-2 transition disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                            >
                                <option value="">Select State</option>
                                {selectedCountry && State.getStatesOfCountry(selectedCountry).map((s) => (
                                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                ))}
                            </select>

                            {/* City */}
                            <select
                                value={selectedCity}
                                disabled={!selectedState}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-2 transition disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'}`}
                            >
                                <option value="">Select City</option>
                                {selectedState && City.getCitiesOfState(selectedCountry, selectedState).map((city) => (
                                    <option key={city.name} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className={`block text-sm font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number
                        </label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="Ex: 919876543210"
                            className={`w-full p-2.5 border rounded-lg outline-none transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'} ${errors.whatsapp ? 'border-red-500' : ''}`}
                        />
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                        <p className={`text-[10px] mt-1 italic ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>* Enter digits only, including country code (e.g. 91...)</p>
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label className={`block text-sm font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                                className={`w-full pl-9 p-2.5 border rounded-lg outline-none transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'} ${errors.linkedin ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>}
                    </div>
                </div>

                <div className={`p-4 flex justify-end gap-3 flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-t border-white/5' : 'bg-gray-50 border-t'}`}>
                    <button
                        onClick={onClose}
                        className={`px-5 py-2 border rounded-xl transition font-semibold ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
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
          background: ${darkMode ? "#334155" : "#d1d5db"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#475569" : "#9ca3af"};
        }
        :global(.react-tel-input .form-control) {
          width: 100% !important;
        }
        :global(.react-tel-input .selected-flag:hover),
        :global(.react-tel-input .selected-flag:focus) {
          background-color: transparent !important;
        }
      `}</style>
        </div>
    );
}
