"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar"; // ✅ Sidebar added

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/me", {
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
      await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      alert("✅ Profile updated successfully!");
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
      <Sidebar /> {/* ✅ Sidebar on top */}
      
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Your Profile</h1>

        <input
          type="text"
          placeholder="Name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full p-3 bg-white text-gray-700 rounded-lg shadow border focus:outline-none"
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
