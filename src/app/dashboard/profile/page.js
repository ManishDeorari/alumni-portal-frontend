"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Pencil, Eye } from "lucide-react";
import ProfileBanner from "../../components/profile/ProfileBanner";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import SectionCard from "../../components/profile/SectionCard";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar />

      <div className="max-w-5xl mx-auto mt-4 rounded-xl overflow-hidden bg-white shadow-md text-gray-900">
        <ProfileBanner
          banner={profile.bannerImage || "/default_banner.jpg"}
          onUpload={fetchProfile}
        />

        <div className="relative px-6 pb-6">
          {/* Avatar + Basic Info */}
          <div className="relative -top-16 flex items-center gap-4">
            <ProfileAvatar
              image={profile.profileImage}
              onUpload={fetchProfile}
            />
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-600">{profile.college || "No campus info"}</p>
              <p className="text-sm text-gray-500">Enrollment No: {profile.enrollment}</p>
            </div>
          </div>

          {/* Contact and Social */}
          <SectionCard title="Contact & Social" hasData={true}>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
            <p><strong>Address:</strong> {profile.address || "Not provided"}</p>
            <p><strong>WhatsApp:</strong> {profile.whatsapp || "Not linked"}</p>
            <p><strong>LinkedIn:</strong> {profile.linkedin || "Not linked"}</p>
          </SectionCard>

          {/* Connections */}
          <SectionCard title="Connections & Visitors" hasData={true}>
            <p><strong>Followers:</strong> {profile.followers?.length || 0}</p>
            <p><strong>Visitor Count:</strong> {profile.totalViews || 0}</p>
            <p><strong>Today’s Visits:</strong> {profile.todayViews || 0}</p>
          </SectionCard>

          {/* About */}
          <SectionCard title="About" hasData={!!profile.bio}>
            <p>{profile.bio || "No bio written yet."}</p>
          </SectionCard>

          {/* Posts */}
          <SectionCard title="Activity" hasData={!!profile.posts?.length}>
            {profile.posts?.slice(0, 2).map((post, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-sm">{post.content}</p>
              </div>
            ))}
            {profile.posts?.length > 2 && (
              <button className="text-blue-600 underline mt-1">Show all posts</button>
            )}
          </SectionCard>

          {/* Experience */}
          <SectionCard title="Experience" hasData={!!profile.experience?.length}>
            {(profile.experience || []).map((exp, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{exp.title} at {exp.company}</p>
                <p className="text-sm text-gray-600">{exp.startDate} – {exp.endDate}</p>
              </div>
            ))}
            {!profile.experience?.length && <p>No experience added yet.</p>}
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" hasData={!!profile.education?.length}>
            {(profile.education || []).map((edu, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{edu.degree} at {edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.year}</p>
              </div>
            ))}
            {!profile.education?.length && <p>No education history yet.</p>}
          </SectionCard>

          {/* Work Profile */}
          <SectionCard title="Current Work Profile" hasData={!!profile.workProfile}>
            <p><strong>Functional Area:</strong> {profile.workProfile?.functionalArea || "Not set"}</p>
            <p><strong>Sub-functional Area:</strong> {profile.workProfile?.subFunctionalArea || "None"}</p>
            <p><strong>Relevant Experience:</strong> {profile.workProfile?.experience || "Not found"}</p>
            <p><strong>Industry:</strong> {profile.workProfile?.industry || "Not set"}</p>
            <p><strong>Skills:</strong> {(profile.skills || []).join(", ") || "No skills listed"}</p>
          </SectionCard>

          {/* Job Preferences */}
          <SectionCard title="Job Preferences" hasData={!!profile.jobPreferences}>
            <p><strong>Preferred Functional Area:</strong> {profile.jobPreferences?.functionalArea || "Not mentioned"}</p>
            <p><strong>Sub-functional Area:</strong> {profile.jobPreferences?.subFunctionalArea || "Not set"}</p>
            <p><strong>Preferred Locations:</strong> {(profile.jobPreferences?.preferredLocations || []).join(", ") || "None"}</p>
            <p><strong>Current Salary:</strong> {profile.jobPreferences?.salary || "Not mentioned"}</p>
            <p><strong>Notice Period:</strong> {profile.jobPreferences?.noticePeriod || "Not mentioned"}</p>
            <p><strong>Resume:</strong> {profile.jobPreferences?.resumeLink ? (
              <a href={profile.jobPreferences.resumeLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Resume</a>
            ) : "No resume uploaded."}</p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
