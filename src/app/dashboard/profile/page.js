"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Pencil, PlusCircle } from "lucide-react";
import ProfileBanner from "../../components/profile/ProfileBanner";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import SectionCard from "../../components/profile/SectionCard";

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

      {/* Banner */}
      <div className="relative w-full h-56 bg-black">
        <img
          src={profile.bannerImage || "/default_banner.jpg"}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <ProfileBanner banner={profile.bannerImage} onUpload={fetchProfile} />
        
        {/* Floating avatar and basic info */}
        <div className="absolute bottom-[-40px] left-10 flex items-end gap-4">
          <ProfileAvatar image={profile.profileImage} onUpload={fetchProfile} />
          <div className="text-white">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-sm">{profile.college || "College not set"}</p>
            <p className="text-sm text-gray-300">{profile.email}</p>
            <p className="text-sm text-gray-300">Enrollment No: {profile.enrollment}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto mt-20 space-y-6 pb-10">

        {/* Contact + Links */}
        <SectionCard title="Contact & Social" hasData>
          <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
          <p><strong>Address:</strong> {profile.address || "Not set"}</p>
          <p><strong>WhatsApp:</strong> {profile.whatsapp || "Not linked"}</p>
          <p><strong>LinkedIn:</strong> {profile.linkedin || "Not linked"}</p>
        </SectionCard>

        {/* Visitors & Followers */}
        <SectionCard title="Connections & Visitors" hasData>
          <p><strong>Followers:</strong> {profile.followers?.length || 0}</p>
          <p><strong>Total Visitors:</strong> {profile.totalViews || 0}</p>
          <p><strong>Today’s Visits:</strong> {profile.todayViews || 0}</p>
        </SectionCard>

        {/* About */}
        <SectionCard title="About" hasData={!!profile.bio}>
          <p>{profile.bio || "No bio available."}</p>
        </SectionCard>

        {/* Activity Preview */}
        <SectionCard title="Activity" hasData={!!profile.posts?.length}>
          {profile.posts?.slice(0, 2).map((post, idx) => (
            <div key={idx} className="mb-2 text-sm">{post.content}</div>
          ))}
          {profile.posts?.length > 2 && (
            <button className="text-blue-600 underline">See all posts</button>
          )}
        </SectionCard>

        {/* Experience */}
        <SectionCard title="Experience" hasData={!!profile.experience?.length}>
          {profile.experience?.map((exp, idx) => (
            <div key={idx}>
              <p className="font-semibold">{exp.title} at {exp.company}</p>
              <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
          ))}
        </SectionCard>

        {/* Education */}
        <SectionCard title="Education" hasData={!!profile.education?.length}>
          {profile.education?.map((edu, idx) => (
            <div key={idx}>
              <p className="font-semibold">{edu.degree} at {edu.institution}</p>
              <p className="text-sm text-gray-600">{edu.year}</p>
            </div>
          ))}
        </SectionCard>

        {/* Current Work Profile */}
        <SectionCard title="Current Work Profile" hasData={!!profile.workProfile}>
          <p><strong>Functional Area:</strong> {profile.workProfile?.functionalArea || "N/A"}</p>
          <p><strong>Sub-functional Area:</strong> {profile.workProfile?.subFunctionalArea || "None"}</p>
          <p><strong>Experience:</strong> {profile.workProfile?.experience || "N/A"}</p>
          <p><strong>Industry:</strong> {profile.workProfile?.industry || "N/A"}</p>
          <p><strong>Skills:</strong> {(profile.skills || []).join(", ") || "No skills listed"}</p>
        </SectionCard>

        {/* Job Preferences */}
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
