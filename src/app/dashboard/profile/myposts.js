"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/Post/PostCard";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      // 1) posts
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await res.json();

      // 2) current user
      const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();

      setPosts(Array.isArray(postsData) ? postsData.reverse() : []);
      setCurrentUser(userData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching my posts:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>
        {posts.length > 0 ? (
          posts
            .filter((p) => p && p._id)
            .map((post) => (
              <div key={post._id} className="mb-6">
                <PostCard
                  post={post}
                  currentUser={currentUser} // ✅ important
                  setPosts={setPosts}
                />
              </div>
            ))
        ) : (
          <p className="text-gray-200">You haven’t created any posts yet.</p>
        )}
      </div>
    </div>
  );
}
