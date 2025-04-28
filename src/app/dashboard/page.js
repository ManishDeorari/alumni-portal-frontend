"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { fetchUser, fetchPosts } from "@/api/dashboard";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetchUser();
        const postRes = await fetchPosts();
        setUser(userRes);
        setPosts(postRes);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error.message);
      }
    };
    fetchData();
  }, []);

  if (!user) return <div className="text-center p-10 text-lg">Loading dashboard...</div>;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <main className="p-6">
        <CreatePost />
        {posts.length > 0 ? posts.map((post) => <PostCard key={post._id} post={post} />) : <p>No posts yet.</p>}
      </main>
    </div>
    </ProtectedRoute>
  );
}