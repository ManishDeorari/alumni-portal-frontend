"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const CLOUDINARY_UPLOAD_PRESET = "your_preset_name";
  const CLOUDINARY_CLOUD_NAME = "your_cloud_name";

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

  const handleUploadImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      let imageUrl = profile.profileImage;

      if (imageFile) {
        const uploaded = await handleUploadImage();
        if (uploaded) imageUrl = uploaded;
      }

      const updatedProfile = { ...profile, profileImage: imageUrl };
      await fetch("https://alumni-backend-d9k9.onrender.com/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      alert("✅ Profile updated successfully!");
      fetchProfile(); // refresh
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
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Your Profile</h1>

        {/* Profile Image Preview */}
        {profile.profileImage && (
          <img
            src={profile.profileImage}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover mx-auto mb-2 border"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-gray-100"
        />

        {/* Inputs */}
        <input
          type="text"
          placeholder="Name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Email"
          value={profile.email || ""}
          disabled
          className="w-full p-3 bg-gray-300 text-gray-700 rounded shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Enrollment Number"
          value={profile.enrollmentNumber || ""}
          disabled
          className="w-full p-3 bg-gray-300 text-gray-700 rounded shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Bio"
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded shadow border focus:outline-none"
        />

        {/* Additional Fields */}
        <input
          type="text"
          placeholder="Job Title"
          value={profile.job || ""}
          onChange={(e) => setProfile({ ...profile, job: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Course"
          value={profile.course || ""}
          onChange={(e) => setProfile({ ...profile, course: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Graduation Year"
          value={profile.graduationYear || ""}
          onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded shadow border focus:outline-none"
        />

        <button
          onClick={updateProfile}
          className="bg-white text-blue-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition w-full"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
