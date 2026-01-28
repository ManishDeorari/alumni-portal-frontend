import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Phone, MapPin, Globe, Linkedin, MessageCircle, User } from "lucide-react";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function EditBasicInfoModal({ isOpen, onClose, currentProfile, onSave }) {
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
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

                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User className="w-4 h-4 text-purple-500" /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className={`w-full p-2 border rounded-lg outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="phone-input-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
                                border: errors.phone ? "1px solid #ef4444" : "1px solid #d1d5db",
                                fontSize: "14px",
                            }}
                            buttonStyle={{
                                borderRadius: "8px 0 0 8px",
                                border: errors.phone ? "1px solid #ef4444" : "1px solid #d1d5db",
                                backgroundColor: "#f9fafb",
                            }}
                            containerStyle={{
                                marginTop: "4px",
                            }}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Address Dropdowns */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none bg-gray-50 focus:ring-2 focus:ring-blue-500"
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number
                        </label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="Ex: 919876543210"
                            className={`w-full p-2 border rounded-lg outline-none transition ${errors.whatsapp ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                        />
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                        <p className="text-[10px] text-gray-500 mt-1 italic">* Enter digits only, including country code (e.g. 91...)</p>
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                                className={`w-full pl-9 p-2 border rounded-lg outline-none transition ${errors.linkedin ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                            />
                        </div>
                        {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        :global(.react-tel-input .form-control) {
          width: 100% !important;
        }
      `}</style>
        </div>
    );
}
