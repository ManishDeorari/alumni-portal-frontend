"use client";

import React, { useEffect, useState } from "react";
import { fetchUser, fetchPosts } from "@/api/dashboard";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // ⏳ 10 seconds timeout

      const userRes = await fetchUser({ signal: controller.signal });
      const postRes = await fetchPosts({ signal: controller.signal });

      clearTimeout(timeoutId);

      setUser(userRes);
      setPosts(postRes);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-purple-700">
        {/* ✨ Beautiful Loading Spinner */}
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="text-white mt-6 text-xl font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-purple-700 text-white text-2xl">
        Failed to load dashboard. Please refresh.
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar user={user} />

        <main className="flex-1 p-6 space-y-6 bg-gradient-to-b from-blue-600 to-purple-700 text-white">
          <CreatePost />
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <p>No posts yet.</p>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
