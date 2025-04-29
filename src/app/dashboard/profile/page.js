"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", profile.name || "");
      formData.append("bio", profile.bio || "");
      if (file) formData.append("profilePic", file);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      {/* Header Sidebar */}
      <Sidebar />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Your Profile</h1>

        {/* Upload Profile Picture */}
        <div className="flex flex-col items-center">
          {file ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white text-gray-400 flex items-center justify-center mb-2">
              📷
            </div>
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-white"
          />
        </div>

        <input
          type="text"
          placeholder="Name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full p-3 bg-white text-gray-800 rounded-lg shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Email"
          value={profile.email || ""}
          disabled
          className="w-full p-3 bg-gray-200 text-gray-600 rounded-lg shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Enrollment Number"
          value={profile.enrollmentNumber || ""}
          disabled
          className="w-full p-3 bg-gray-200 text-gray-600 rounded-lg shadow border focus:outline-none"
        />

        <input
          type="text"
          placeholder="Bio"
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full p-3 bg-white text-gray-800 rounded-lg shadow border focus:outline-none"
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
