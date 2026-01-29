"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProfileAbout from "../../components/profile/ProfileAbout";
import ProfileExperience from "../../components/profile/ProfileExperience";
import ProfileEducation from "../../components/profile/ProfileEducation";
import ProfileActivity from "../../components/profile/ProfileActivity";
import ProfileWorkProfile from "../../components/profile/ProfileWorkProfile";
import ProfileJobPreference from "../../components/profile/ProfileJobPreference";
import ProfileBasicInfo from "../../components/profile/ProfileBasicInfo";

import { useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const profileId = params?.id; // From URL: /dashboard/profile/[id]

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = await currentUserRes.json();

      let targetId = profileId || currentUser._id;
      const viewingOther = profileId && profileId !== currentUser._id;
      setIsPublicView(viewingOther);

      // 1) Profile info (Using public endpoint if viewing others)
      const endpoint = viewingOther
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${targetId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`;

      const resProfile = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await resProfile.json();

      // 2) Posts
      const resPosts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await resPosts.json();

      // 3) Activity (Interactions)
      const resActivity = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activityData = await resActivity.json();

      // 4) Merge into state
      setProfile({
        ...profileData,
        posts: Array.isArray(postsData) ? postsData : [],
        activity: Array.isArray(activityData) ? activityData : [],
      });

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

      {/* 🔷 Top Profile Section (Refactored) */}
      <ProfileBasicInfo
        profile={profile}
        setProfile={setProfile}
        onRefresh={fetchProfile}
        isPublicView={isPublicView}
      />

      {/* 🔽 Rest Sections */}
      <div className="max-w-4xl mx-auto mt-6 space-y-6 pb-10">
        <ProfileAbout profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileExperience profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileEducation profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        {!isPublicView && <ProfileActivity profile={profile} setProfile={setProfile} isPublicView={isPublicView} />}
        <ProfileWorkProfile profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileJobPreference profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
      </div>
    </div>
  );
}
