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

      <div className="max-w-4xl mx-auto mt-4 rounded-xl overflow-hidden bg-white shadow-md text-gray-900">
        <ProfileBanner banner={profile.bannerImage} onUpload={fetchProfile} />

        <div className="relative px-6 pb-6">
          <div className="relative -top-10 flex items-center gap-4">
            <ProfileAvatar image={profile.profileImage} onUpload={fetchProfile} />

            <div>
              <h2 className="text-2xl font-semibold">{profile.name || "Unnamed"}</h2>
              <p className="text-sm text-gray-600">{profile.job || "No job specified"}</p>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            <SectionCard title="About" hasData={!!profile.bio}>
              <p>{profile.bio || "No bio available."}</p>
            </SectionCard>

            <SectionCard title="Education" hasData={!!profile.education?.length}>
              {(profile.education || []).map((edu, idx) => (
                <div key={idx} className="mb-2">
                  <p className="font-semibold">{edu.degree} at {edu.institution}</p>
                  <p className="text-sm text-gray-600">{edu.year}</p>
                </div>
              ))}
              {!profile.education?.length && <p>No education history added.</p>}
            </SectionCard>

            <SectionCard title="Experience" hasData={!!profile.experience?.length}>
              {(profile.experience || []).map((exp, idx) => (
                <div key={idx} className="mb-2">
                  <p className="font-semibold">{exp.title} at {exp.company}</p>
                  <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
                </div>
              ))}
              {!profile.experience?.length && <p>No experience added yet.</p>}
            </SectionCard>

            <SectionCard title="Contact" hasData={!!profile.phone || !!profile.email}>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
              <p><strong>LinkedIn:</strong> {profile.linkedIn || "Not linked"}</p>
            </SectionCard>

            <SectionCard title="Skills" hasData={!!profile.skills?.length}>
              {(profile.skills || []).join(", ") || "No skills listed."}
            </SectionCard>

            <SectionCard title="Resume" hasData={!!profile.jobPreferences?.resumeLink}>
              {profile.jobPreferences?.resumeLink ? (
                <a
                  href={profile.jobPreferences.resumeLink}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </a>
              ) : (
                "No resume uploaded."
              )}
            </SectionCard>

            <SectionCard title="Job Preferences" hasData={!!profile.jobPreferences?.functionalArea}>
              <p><strong>Functional Area:</strong> {profile.jobPreferences?.functionalArea || "N/A"}</p>
              <p><strong>Preferred Locations:</strong> {(profile.jobPreferences?.preferredLocations || []).join(", ") || "N/A"}</p>
              <p><strong>Notice Period:</strong> {profile.jobPreferences?.noticePeriod || "N/A"}</p>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
