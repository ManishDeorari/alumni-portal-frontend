"use client";

import React, { useEffect, useState } from "react";
import { fetchPosts, fetchUser } from "@/api/dashboard";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Leaderboard from "@/app/components/Leaderboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <header className="fixed top-0 left-0 w-full bg-purple-700 p-4 z-10">
        <h1 className="text-xl font-bold text-white">Alumni Portal</h1>
      </header>
      
      <div className="flex pt-16"> {/* Added pt-16 to offset header */}
        {/* Left Sidebar - Alumni List */}
        <div className="w-1/4 bg-purple-800 p-6">
          <Sidebar />
        </div>

        {/* Right Section - Posts and Leaderboard */}
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 space-y-6">
          <CreatePost setPosts={setPosts} />
          
          {posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <PostCard key={post._id} post={post} currentUser={user} setPosts={setPosts} />
              ))
          ) : (
            <p>No posts yet.</p>
          )}
        </main>
      </div>
      
      <section className="mt-10">
        <Leaderboard />
      </section>
    </div>
  );
}
