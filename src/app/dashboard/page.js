"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("User fetch failed");
    return await res.json();
  };

  const fetchPosts = async () => {
    const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts");
    if (!res.ok) throw new Error("Posts fetch failed");
    return await res.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetchUser();
        const postRes = await fetchPosts();

        setUser(userRes);
        setPosts(postRes);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar user={user} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <CreatePost />
        {posts.length > 0 ? (
          posts
            .slice()
            .reverse()
            .map((post) => <PostCard key={post._id} post={post} user={user} />)
        ) : (
          <p>No posts yet.</p>
        )}
      </main>
    </div>
  );
}
