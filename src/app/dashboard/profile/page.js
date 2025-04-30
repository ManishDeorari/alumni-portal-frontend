"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
    }
  };

  // ✅ Upload image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      setProfile({ ...profile, imageUrl: data.secure_url });
    } else {
      alert("❌ Image upload failed");
    }
  };

  // ✅ Save updated profile
  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("https://alumni-backend-d9k9.onrender.com/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      alert("✅ Profile updated!");
    } catch (error) {
      console.error("❌ Error updating profile:", error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />

      <div className="p-6 max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Your Profile</h1>

        {/* Profile image */}
        <div className="flex flex-col items-center">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border mb-2"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white text-gray-400 flex items-center justify-center mb-2 text-sm border">
              No Image
            </div>
          )}
          <label className="text-sm font-medium text-white text-center">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block mt-1 text-white text-sm text-center"
            />
          </label>
        </div>

        {/* Form Fields */}
        <input
          type="text"
          placeholder="Name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded-lg shadow border focus:outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={profile.email || ""}
          disabled
          className="w-full p-3 bg-gray-200 text-gray-600 rounded-lg shadow border"
        />

        <input
          type="text"
          placeholder="Enrollment Number"
          value={profile.enrollmentNumber || ""}
          disabled
          className="w-full p-3 bg-gray-200 text-gray-600 rounded-lg shadow border"
        />

        <input
          type="text"
          placeholder="Bio"
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded-lg shadow border focus:outline-none"
        />

        <button
          onClick={updateProfile}
          className="bg-white text-blue-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
