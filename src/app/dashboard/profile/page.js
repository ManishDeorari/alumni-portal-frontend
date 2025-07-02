"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white pt-[80px]">
      <Sidebar />

      <div className="p-6 max-w-xl mx-auto space-y-6 bg-white text-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-700">Your Profile</h1>

        <div className="flex flex-col items-center space-y-2">
          <img
            src={profile.profileImage || "/default-profile.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border"
          />
          <p className="text-lg font-semibold">{profile.name || "Unnamed"}</p>
        </div>

        <div className="space-y-2">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Enrollment Number:</strong> {profile.enrollmentNumber}</p>
          <p><strong>Bio:</strong> {profile.bio || "No bio added."}</p>
          <p><strong>Job Title:</strong> {profile.job || "Not specified"}</p>
          <p><strong>Course:</strong> {profile.course || "Not specified"}</p>
          <p><strong>Graduation Year:</strong> {profile.graduationYear || "Not specified"}</p>
        </div>

        <div className="text-center">
          <Link href="/dashboard/profile/edit">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Edit Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
