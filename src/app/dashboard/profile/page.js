"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import ProfileAbout from "../../components/profile/ProfileAbout";
import ProfileExperience from "../../components/profile/ProfileExperience";
import ProfileEducation from "../../components/profile/ProfileEducation";
import ProfileActivity from "../../components/profile/ProfileActivity";
import ProfileWorkProfile from "../../components/profile/ProfileWorkProfile";
import ProfileJobPreference from "../../components/profile/ProfileJobPreference";
import ProfileBasicInfo from "../../components/profile/ProfileBasicInfo";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id"); // From URL: /dashboard/profile?id=[id]
  const router = useRouter();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = await currentUserRes.json();
      const currentUserId = currentUser?._id?.toString();

      let targetId = profileId || currentUserId;
      const viewingOther = !!(profileId && profileId.toString() !== currentUserId);
      setIsPublicView(viewingOther);

      // 1) Profile info
      const endpoint = viewingOther
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${targetId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`;

      const resProfile = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await resProfile.json();

      // 2) Posts - If viewing other, we might need a different endpoint, or use targetId
      const postsEndpoint = viewingOther
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/posts?userId=${targetId}&limit=50&type=all`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts`;

      const resPosts = await fetch(postsEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsRaw = await resPosts.json();
      const postsData = postsRaw.posts || postsRaw; // Handle both {posts, total} and array formats

      // 3) Activity (Interactions)
      let activityData = [];
      if (!viewingOther) {
        const resActivity = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resActivity.ok) {
          activityData = await resActivity.json();
        }
      }

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
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <div className="p-10 text-center text-white">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <Sidebar />

      {/* 🔷 Top Profile Section with Conditional Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6 flex flex-col md:flex-row gap-4 items-start">
        {isPublicView && (
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-md text-white group shadow-lg h-fit mt-2"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}

        <div className="flex-1 w-full">
          <ProfileBasicInfo
            profile={profile}
            setProfile={setProfile}
            onRefresh={fetchProfile}
            isPublicView={isPublicView}
          />
        </div>
      </div>

      {/* 🔽 Rest Sections */}
      <div className="max-w-4xl mx-auto mt-6 space-y-6 pb-10">
        <ProfileAbout profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileEducation profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileExperience profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        {!isPublicView && <ProfileActivity profile={profile} setProfile={setProfile} isPublicView={isPublicView} />}
        <ProfileWorkProfile profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileJobPreference profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
      </div>
    </div>
  );
}
