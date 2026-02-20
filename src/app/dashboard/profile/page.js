"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import ProfileAbout from "../../components/profile/ProfileAbout";
import ProfileExperience from "../../components/profile/ProfileExperience";
import ProfileEducation from "../../components/profile/ProfileEducation";
import ProfileActivity from "../../components/profile/ProfileActivity";
import ProfileWorkProfile from "../../components/profile/ProfileWorkProfile";
import ProfileJobPreference from "../../components/profile/ProfileJobPreference";
import ProfileBasicInfo from "../../components/profile/ProfileBasicInfo";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id"); // From URL: /dashboard/profile?id=[id]
  const { darkMode } = useTheme();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    setIsAdmin(userData?.isAdmin || userData?.role === "admin");
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = currentUser?._id;

      // Determine the target user profile to fetch
      const targetId = profileId || currentUserId;
      const viewingOther = !!(profileId && profileId !== currentUserId);
      setIsPublicView(viewingOther);

      // If no ID is available and we don't have a token, then redirect
      if (!targetId && !token) {
        console.warn("[Profile] No targetId or token found, redirecting to login.");
        router.push("/auth/login");
        return;
      }

      // 1) Profile info
      const profileEndpoint = viewingOther
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/profile/${targetId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/me`;

      const resProfile = await fetch(profileEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await resProfile.json();

      // 2) Posts
      const postsEndpoint = viewingOther
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts?userId=${targetId}&limit=50&type=all`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/myposts`;

      const resPosts = await fetch(postsEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsRaw = await resPosts.json();
      const postsData = postsRaw.posts || postsRaw;

      // 3) Activity
      let activityData = [];
      if (!viewingOther) {
        const resActivity = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resActivity.ok) {
          activityData = await resActivity.json();
        }
      }

      setProfile({
        ...profileData,
        posts: Array.isArray(postsData) ? postsData : [],
        activity: Array.isArray(activityData) ? activityData : [],
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
    }
  }, [profileId, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="font-bold tracking-widest text-xs uppercase">Loading Profile...</p>
      </div>
    </div>
  );

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <SidebarComponent />

      {/* 🔷 Top-Left Back Button (Fixed) */}
      {isPublicView && (
        <button
          onClick={() => router.back()}
          className={`fixed top-24 left-8 z-50 flex items-center justify-center p-3 border rounded-xl transition-all backdrop-blur-md group shadow-xl ${darkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* 🔷 Top Profile Section */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="w-full">
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
