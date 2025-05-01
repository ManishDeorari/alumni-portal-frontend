"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";

export default function OtherProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("❌ Error loading profile:", error.message);
      }
    };

    fetchProfile();
  }, [id]);

  if (!user) return <div className="text-white text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center mb-6">{user.name}'s Profile</h1>

        <img
          src={user.profilePic || "/default-user.jpg"}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white"
        />

        {[
          { label: "Email", value: user.email },
          { label: "Enrollment No", value: user.enrollmentNumber },
          { label: "Bio", value: user.bio || "No bio added" },
          { label: "Job", value: user.job || "Not updated" },
          { label: "Course", value: user.course || "Not updated" },
          { label: "Year", value: user.year || "Not updated" },
        ].map((field, i) => (
          <div key={i}>
            <label className="font-semibold">{field.label}</label>
            <p className="bg-white text-gray-800 p-3 rounded shadow">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
