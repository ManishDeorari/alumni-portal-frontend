"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Camera } from "lucide-react";
import SectionCard from "../../components/profile/SectionCard";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <Sidebar />

      {/* 🔷 Top Profile Section */}
      <div className="max-w-4xl mx-auto mt-4 rounded-xl overflow-hidden bg-white shadow-md text-gray-900">
        
        {/* 🔷 Banner */}
        <div className="relative w-full h-36 bg-black">
          <img
            src={profile.bannerImage || "/default_banner.jpg"}
            alt="Banner"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          
          {/* 📷 Camera Icon for Banner */}
          <div className="absolute top-2 right-2 z-10">
            <Camera className="text-white hover:text-blue-300 cursor-pointer w-5 h-5" />
          </div>
        </div>

        {/* 🔷 Profile Info Block */}
        <div className="relative px-6 pb-6 -mt-12 flex flex-col items-center">
          
          {/* 🟣 Profile Picture + Camera Icon (outside the circle) */}
          <div className="relative flex justify-center">
            {/* Circle Avatar */}
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-md bg-gray-200">
              <img
                src={profile.profileImage || "/default-profile.jpg"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>

            {/* 📷 Camera Icon positioned outside the circle */}
            <div className="absolute bottom-1 left-1/2 translate-x-8 bg-white p-1 rounded-full shadow cursor-pointer">
              <Camera className="w-4 h-4 text-gray-700" />
            </div>
          </div>

          {/* Name, Email, Enrollment */}
          <div className="flex-1 space-y-1 mt-4">  {/* <-- Added mt-4 */}
            <h2 className="text-2xl font-bold">{profile.name || "Unnamed User"}</h2>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {profile.email}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Enrollment No:</strong> {profile.enrollmentNumber || "N/A"}
            </p>
          </div>

          {/* 🔷 Connections, Visitors, Today Stats */}
          <div className="flex justify-between items-end w-full px-6 pt-6 pb-2 mt-6">
            {/* Connection - Left */}
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Connections</p>
              <Link href="/dashboard/connections">
                <button className="text-xl font-bold text-blue-600 hover:underline">
                  {profile.followers?.length || 0}
                </button>
              </Link>
            </div>

            {/* Total Visitors - Center */}
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Total Visitors</p>
              <p className="text-xl font-bold text-purple-600">
                {profile.totalViews || 0}
              </p>
            </div>

            {/* Today's Visit - Right */}
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Today’s Visits</p>
              <p className="text-xl font-bold text-green-600">
                {profile.todayViews || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Sections */}
      <div className="max-w-4xl mx-auto mt-20 space-y-6 pb-10">

        <SectionCard title="Contact & Social" hasData>
          <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
          <p><strong>Address:</strong> {profile.address || "Not set"}</p>
          <p><strong>WhatsApp:</strong> {profile.whatsapp || "Not linked"}</p>
          <p><strong>LinkedIn:</strong> {profile.linkedin || "Not linked"}</p>
        </SectionCard>

        <SectionCard title="Connections & Visitors" hasData>
          <p><strong>Followers:</strong> {profile.followers?.length || 0}</p>
          <p><strong>Total Visitors:</strong> {profile.totalViews || 0}</p>
          <p><strong>Today’s Visits:</strong> {profile.todayViews || 0}</p>
        </SectionCard>

        <SectionCard title="About" hasData={!!profile.bio}>
          <p>{profile.bio || "No bio available."}</p>
        </SectionCard>

        <SectionCard title="Activity" hasData={!!profile.posts?.length}>
          {profile.posts?.slice(0, 2).map((post, idx) => (
            <div key={idx} className="mb-2 text-sm">{post.content}</div>
          ))}
          {profile.posts?.length > 2 && (
            <button className="text-blue-600 underline">See all posts</button>
          )}
        </SectionCard>

        <SectionCard title="Experience" hasData={!!profile.experience?.length}>
          {profile.experience?.map((exp, idx) => (
            <div key={idx}>
              <p className="font-semibold">{exp.title} at {exp.company}</p>
              <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Education" hasData={!!profile.education?.length}>
          {profile.education?.map((edu, idx) => (
            <div key={idx}>
              <p className="font-semibold">{edu.degree} at {edu.institution}</p>
              <p className="text-sm text-gray-600">{edu.year}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Current Work Profile" hasData={!!profile.workProfile}>
          <p><strong>Functional Area:</strong> {profile.workProfile?.functionalArea || "N/A"}</p>
          <p><strong>Sub-functional Area:</strong> {profile.workProfile?.subFunctionalArea || "None"}</p>
          <p><strong>Experience:</strong> {profile.workProfile?.experience || "N/A"}</p>
          <p><strong>Industry:</strong> {profile.workProfile?.industry || "N/A"}</p>
          <p><strong>Skills:</strong> {(profile.skills || []).join(", ") || "No skills listed"}</p>
        </SectionCard>

        <SectionCard title="Job Preferences" hasData={!!profile.jobPreferences}>
          <p><strong>Preferred Functional Area:</strong> {profile.jobPreferences?.functionalArea || "N/A"}</p>
          <p><strong>Preferred Locations:</strong> {(profile.jobPreferences?.preferredLocations || []).join(", ") || "N/A"}</p>
          <p><strong>Notice Period:</strong> {profile.jobPreferences?.noticePeriod || "N/A"}</p>
          <p><strong>Salary:</strong> {profile.jobPreferences?.salary || "N/A"}</p>
          <p><strong>Resume:</strong> {
            profile.jobPreferences?.resumeLink
              ? <a href={profile.jobPreferences.resumeLink} className="text-blue-600 underline" target="_blank">View Resume</a>
              : "No resume uploaded."
          }</p>
        </SectionCard>
      </div>
    </div>
  );
}
