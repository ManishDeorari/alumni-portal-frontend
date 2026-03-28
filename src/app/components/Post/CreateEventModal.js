"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createEvent } from "../../../api/dashboard";
import EmojiPickerToggle from "./utils/EmojiPickerToggle";

const CreateEventModal = ({ isOpen, onClose, currentUser, darkMode = false, setPosts }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    timezone: "IST",
    endDate: "",
    registrationCloseDate: "",
    allowGroupRegistration: true,
    showRegistrationInsights: true,
  });

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Registration Form Builder State
  const [registrationFields, setRegistrationFields] = useState({
    name: true,
    profileLink: true,
    enrollmentNumber: true,
    email: true,
    phoneNumber: true,
    course: true,
    courseYear: true,
    branchName: true,
    currentCompany: true,
    currentCity: true,
  });

  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldToggle = (field) => {
    setRegistrationFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, { question: newQuestion, type: "text" }]);
      setNewQuestion("");
    }
  };

  const removeCustomQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      toast.error("You can upload up to 6 images.");
      return;
    }
    setImages([...images, ...files]);
    setVideo(null);
    setPreviewVideo(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("❌ Video must be smaller than 100MB.");
        return;
      }
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
      setImages([]);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setFormData((prev) => ({ ...prev, description: prev.description + emoji.native }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error("❌ Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Media to Cloudinary (Simplified: we reuse logic in our mind as dashboard.js handles it, 
      // but here we need to mirror what createPost does if we want to handle uploads in CreateEventModal)
      // Actually, dashboard.js has createPost which handles uploads. I should make createEvent handle uploads too.
      // I'll update dashboard.js createEvent to handle media uploads.
      
      const eventData = {
        ...formData,
        registrationFields,
        customQuestions,
        images: [], // Placeholder, will be filled by updated createEvent in dashboard.js
        video: null, // Placeholder
      };

      // I'll call a specialized function that handles media + event creation
      // For now, let's assume createEvent in dashboard.js needs to be updated to handle media.
      // WAIT: I already updated dashboard.js with a simple createEvent. Let me fix that first.
      
      const result = await createEventWithMedia(eventData, images, video);

      if (result.event) {
        toast.success("🎉 Event created successfully!");
        // We do NOT manually call setPosts here. The backend emits 'postCreated' 
        // to all sockets (including this exact client), perfectly avoiding duplicate React keys.
        onClose();
      } else {
        toast.error("❌ Failed to create event.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Media Upload (reusing logic from DashboardPage createPost)
  const createEventWithMedia = async (eventData, imageFiles, videoFile) => {
    let imageObjects = [];
    let videoObject = null;

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (img) => {
        const imageData = new FormData();
        imageData.append("file", img);
        imageData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        imageData.append("folder", "alumni/events/images");
        const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
          method: "POST",
          body: imageData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok) return { url: uploadJson.secure_url, public_id: uploadJson.public_id };
        return null;
      });

      const results = await Promise.all(uploadPromises);
      imageObjects = results.filter(res => res !== null);
    }

    if (videoFile) {
      const videoData = new FormData();
      videoData.append("file", videoFile);
      videoData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      videoData.append("folder", "alumni/events/videos");
      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, {
        method: "POST",
        body: videoData,
      });
      const uploadJson = await uploadRes.json();
      if (uploadRes.ok) videoObject = { url: uploadJson.secure_url, public_id: uploadJson.public_id };
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ...eventData, images: imageObjects, video: videoObject }),
    });
    return res.json();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-2xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"} border rounded-[2.5rem] shadow-2xl overflow-hidden my-auto`}>
        {/* Header */}
        <div className={`px-8 py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
          <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight flex items-center gap-2`}>
            <span>📅</span> Create Event
          </h2>
          <button onClick={onClose} className={`text-2xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-black"} transition-colors`}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Media Section */}
          <div className="space-y-4">
            <div className={`p-6 border-2 border-dashed ${darkMode ? "border-white/20 bg-white/5" : "border-gray-200 bg-gray-50"} rounded-3xl text-center`}>
              <div className="flex justify-center gap-6 mb-4">
                <label className="cursor-pointer group">
                  <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">📷</span>
                  <span className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Photos</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
                <label className="cursor-pointer group">
                  <span className="text-3xl block filter grayscale group-hover:grayscale-0 transition-all">🎥</span>
                  <span className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Add Video</span>
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
              </div>

              {/* Media Preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {previewVideo && (
                <div className="mt-4 rounded-xl overflow-hidden max-h-48">
                  <video src={previewVideo} controls className="w-full" />
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Event Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title..."
                className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} focus:border-blue-500 outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} outline-none`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} outline-none`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} outline-none`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Reg. Close Date</label>
              <input
                type="date"
                name="registrationCloseDate"
                value={formData.registrationCloseDate}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} outline-none`}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Description</label>
              <EmojiPickerToggle onEmojiSelect={handleEmojiSelect} icon="😀" darkMode={darkMode} />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your event..."
              className={`w-full p-4 rounded-2xl border-2 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"} focus:border-blue-500 outline-none resize-none transition-all`}
            />
          </div>

          {/* Registration Form Builder */}
          <div className={`p-6 rounded-[2rem] ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} border space-y-6`}>
            <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Registration Form <span className="text-xs font-normal opacity-60 ml-2">[Questions to be asked]</span></h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(registrationFields).map((field) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                    checked={registrationFields[field]}
                    onChange={() => handleFieldToggle(field)}
                  />
                  <span className={`text-sm font-bold capitalize ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-gray-300 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Custom question..."
                  className={`flex-1 p-3 text-sm rounded-xl border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                />
                <button type="button" onClick={addCustomQuestion} className="px-4 py-2 bg-black text-white rounded-xl font-bold text-sm">+ Add</button>
              </div>

              <div className="space-y-2">
                {customQuestions.map((q, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-white/5" : "bg-white shadow-sm"}`}>
                    <span className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{q.question}</span>
                    <button type="button" onClick={() => removeCustomQuestion(i)} className="text-red-500 text-sm font-bold">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Event Settings</h3>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <span className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Allow Group Registration (2-4 members)</span>
                <input type="checkbox" name="allowGroupRegistration" checked={formData.allowGroupRegistration} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
              </label>
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <span className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Show counts and names of registered users</span>
                <input type="checkbox" name="showRegistrationInsights" checked={formData.showRegistrationInsights} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
              </label>
            </div>
          </div>

          {/* Post Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-blue-500/25"
            }`}
          >
            {loading ? "Creating System..." : "Post Event Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
