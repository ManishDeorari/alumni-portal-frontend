"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Camera, Copy, Edit } from "lucide-react";
import SectionCard from "../../components/profile/SectionCard";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import ProfileBanner from "../../components/profile/ProfileBanner";
import PostCard from "@/app/components/Post/PostCard";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // 1) Profile info
      const resProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await resProfile.json();

      // 2) Posts
      const resPosts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await resPosts.json();

      // 3) Merge into state
      setProfile({
        ...profileData,
        posts: Array.isArray(postsData) ? postsData : [],
      });

      setWhatsapp(profileData.whatsapp || "");
      setLinkedin(profileData.linkedin || "");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUpdateSocial = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-social`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ whatsapp, linkedin }),
      });
      const data = await res.json();
      setProfile(prev => ({ ...prev, whatsapp: data.whatsapp, linkedin: data.linkedin }));
      setShowModal(false);
    } catch (error) {
      alert("Failed to update social links");
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
      <div className="max-w-4xl mx-auto mt-3 rounded-xl overflow-hidden bg-white shadow-md text-gray-900">
        {/* 🔷 Banner */}
        <div className="relative w-full h-36">
          <ProfileBanner
            image={profile.bannerImage}
            onUpload={fetchProfile}
            userId={profile._id}
          />
        </div>

        {/* 🔷 Profile Info Block */}
        <div className="relative px-6 pb-6 -mt-12 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative flex justify-center">
            <ProfileAvatar image={profile.profilePicture} onUpload={fetchProfile} userId={profile._id} />
          </div>

          {/* Name + Edit */}
          <div className="flex justify-center w-full mt-4 relative">
            <h2 className="text-2xl font-bold">{profile.name || "Unnamed User"}</h2>
            <Edit
              className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800 absolute right-4 top-1"
              title="Edit Social Links"
              onClick={() => setShowModal(true)}
            />
          </div>

          {/* Email & Enrollment */}
          <div className="w-full max-w-md text-center mt-3 space-y-2">
            <div className="flex justify-center items-center gap-2 text-sm text-gray-700">
              <strong>Email:</strong> {profile.email}
              {profile.email && (
                <Copy
                  onClick={() => copyToClipboard(profile.email, "email")}
                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600"
                  title="Copy Email"
                />
              )}
              {copied === "email" && <span className="text-green-500 ml-1">Copied</span>}
            </div>

            <div className="text-sm text-gray-700">
              <strong>Enrollment No:</strong> {profile.enrollmentNumber || "N/A"}
            </div>

            {/* Personal Info Section */}
            <div className="text-sm text-gray-700 space-y-1 pt-1">
              <div className="flex justify-center items-center gap-2">
                <strong>Phone:</strong> {profile.phone || "Not provided"}
                {profile.phone && (
                  <Copy
                    onClick={() => copyToClipboard(profile.phone, "phone")}
                    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600"
                    title="Copy Phone"
                  />
                )}
                {copied === "phone" && <span className="text-green-500 ml-1">Copied</span>}
              </div>
              <p><strong>Address:</strong> {profile.address || "Not set"}</p>
              <p><strong>WhatsApp:</strong> {profile.whatsapp || "Not linked"}</p>
              <p><strong>LinkedIn:</strong> {profile.linkedin || "Not linked"}</p>
            </div>
          </div>

          {/* 🔷 Stats */}
          <div className="flex justify-between items-end w-full px-6 pt-6 pb-2 mt-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Connections</p>
              <Link href="/dashboard/connections">
                <button className="text-xl font-bold text-blue-600 hover:underline">
                  {profile.followers?.length || 0}
                </button>
              </Link>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Total Visitors</p>
              <p className="text-xl font-bold text-purple-600">{profile.totalViews || 0}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500">Today’s Visits</p>
              <p className="text-xl font-bold text-green-600">{profile.todayViews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Rest Sections */}
      <div className="max-w-4xl mx-auto mt-20 space-y-6 pb-10">
        <SectionCard title="About" hasData={!!profile.bio}>
          <p>{profile.bio || "No bio available."}</p>
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

        {/* 🔷 Activity Section (Moved below Education) */}
         <SectionCard
        title="Activity"
        hasData={profile.posts && profile.posts.length > 0}
      >
        {profile.posts && profile.posts.length > 0 ? (
          <div className="mt-2">
            <h3 className="font-semibold text-gray-800 mb-2">Your Posts</h3>
            {profile.posts
              .filter((p) => p && p._id)
              .slice()
              .reverse()
              .slice(0, 2)
              .map((post) => (
                <div key={post._id} className="mb-4">
                  <PostCard
                    post={post}
                    currentUser={profile} // ✅ pass user
                    setPosts={(updateFn) =>
                      setProfile((prev) => ({
                        ...prev,
                        posts: typeof updateFn === "function"
                          ? updateFn(prev.posts || [])
                          : updateFn,
                      }))
                    }
                    isProfileActivity
                  />
                </div>
              ))}

            {profile.posts.length > 2 && (
              <button
                onClick={() => (window.location.href = "/dashboard/profile/myposts")}
                className="text-blue-600 underline"
              >
                See all posts
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No activity yet.</p>
        )}

        {/* 🔹 Show Reactions, Comments, Replies */}
        {Array.isArray(profile.activity) && profile.activity.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Your Interactions</h3>
            {profile.activity.slice(0, 2).map((activity, idx) => (
              <div key={idx} className="mb-3 text-sm">
                {activity.type === "reaction" && (
                  <p>
                    You reacted <span className="font-bold">{activity.reaction}</span> to a post
                  </p>
                )}
                {activity.type === "comment" && (
                  <p>
                    You commented:{" "}
                    <span className="italic">"{String(activity.text || "")}"</span>
                  </p>
                )}
                {activity.type === "reply" && (
                  <p>
                    You replied:{" "}
                    <span className="italic">"{String(activity.text || "")}"</span>
                  </p>
                )}
              </div>
            ))}
            {profile.activity.length > 2 && (
              <button
                onClick={() => (window.location.href = "/dashboard/myactivity")}
                className="text-blue-600 underline"
              >
                See all activity
              </button>
            )}
          </div>
        )}
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

      {/* 🔘 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">Update Social Links</h2>
            <div>
              <label className="text-sm text-gray-600">WhatsApp:</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">LinkedIn:</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-1 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleUpdateSocial} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
