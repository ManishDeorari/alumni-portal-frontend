import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Save, Phone, MapPin, Globe, Linkedin, MessageCircle, User } from "lucide-react";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTheme } from "@/context/ThemeContext";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function EditBasicInfoModal({ isOpen, onClose, currentProfile, onSave }) {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        whatsapp: "",
        linkedin: "",
        secondaryEmail: "",
    });

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
                secondaryEmail: currentProfile.secondaryEmail || "",
            });

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
                setSelectedCountry("");
                setSelectedState("");
                setSelectedCity("");
            }
        }
    }, [currentProfile, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Input Locks
        if (name === "name") {
            value = value.replace(/[^a-zA-Z\s\.\-']/g, '');
        } else if (name === "whatsapp") {
            value = value.replace(/\D/g, '');
        } else if (name === "secondaryEmail") {
            value = value.toLowerCase().replace(/\s/g, '');
        } else if (name === "portfolio" || name === "github" || name === "linkedin") {
            value = value.replace(/\s/g, '');
        }

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
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        } else if (formData.linkedin && !URL_REGEX.test(formData.linkedin)) {
            newErrors.linkedin = "Invalid URL format.";
        }

        if (formData.secondaryEmail && !EMAIL_REGEX.test(formData.secondaryEmail)) {
            newErrors.secondaryEmail = "Please enter a valid email format.";
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
            let fullAddress = "";
            if (selectedCountry && selectedState && selectedCity) {
                const cName = Country.getCountryByCode(selectedCountry)?.name;
                const sName = State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name;
                fullAddress = `${selectedCity}, ${sName}, ${cName}`;
            }

            const payload = {
                ...formData,
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
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onSave(updatedUser);
            toast.success("Profile details updated successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error updating profile details");
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
                        <User className="w-5 h-5" /> Edit Personal Details
                    </h2>
                    
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
        </div>
        </>
    );
}
