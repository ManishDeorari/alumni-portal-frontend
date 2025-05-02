// src/app/dashboard/profile/[id]/page.js

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/user/${id}`);
      const data = await res.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching public profile:", error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-white">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-center">Alumni Profile</h1>

        <p className="text-sm text-gray-300 text-center mt-2">
          This is {user.name}&apos;s public profile
        </p>

        <div className="flex justify-center">
          <img
            src={user.profilePicture || "/default-profile.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-white"
          />
        </div>

        <div className="space-y-2">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Enrollment Number:</strong> {user.enrollmentNumber}</p>
          {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
          {user.jobTitle && <p><strong>Job:</strong> {user.jobTitle}</p>}
          {user.course && <p><strong>Course:</strong> {user.course}</p>}
          {user.year && <p><strong>Year:</strong> {user.year}</p>}
        </div>
      </div>
    </div>
  );
}
