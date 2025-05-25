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
      {/* Top header (your "Sidebar" component used as header) */}
      <header className="fixed top-0 left-0 w-full z-50">
        <Sidebar />
      </header>

      {/* Main content below header */}
      <div className="flex pt-16 min-h-screen px-4 gap-6">
        {/* Left: Leaderboard - 30% width, white background for contrast */}
        <aside className="w-3/10 min-w-[280px] bg-white p-6 rounded-md shadow-md text-black sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Alumni Award Leaderboard</h2>
          <Leaderboard />
        </aside>

        {/* Right: Posts section - 70% width */}
        <main className="flex-1 max-w-4xl space-y-6 text-white">
          <CreatePost setPosts={setPosts} />
          {posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  setPosts={setPosts}
                />
              ))
          ) : (
            <p>No posts yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
