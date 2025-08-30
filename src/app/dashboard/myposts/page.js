"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/Post/PostCard";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  // fetch current user
  const fetchUser = async (token) => {
    const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await resUser.json();
    setCurrentUser(userData);
  };

  // fetch only MY posts
  const fetchMyPosts = async (pageNum = 1, append = false, tokenFromArg) => {
    const token = tokenFromArg || localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/myposts?page=${pageNum}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      console.error("❌ Failed to fetch my posts:", res.status);
      setPosts([]);
      setHasMore(false);
      return;
    }

    const data = await res.json();

    // ✅ Case A: plain array of posts
    if (Array.isArray(data)) {
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
      setHasMore(false); // no pagination support
      return;
    }

    // ✅ Case B: object { posts, total }
    if (data.posts && Array.isArray(data.posts)) {
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      const loaded = (append ? posts.length : 0) + data.posts.length;
      setHasMore(loaded < data.total);
      return;
    }

    console.error("❌ Unexpected response for my posts:", data);
    setPosts([]);
    setHasMore(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        await Promise.all([fetchUser(token), fetchMyPosts(1, false, token)]);
      } catch (e) {
        console.error("❌ Init error:", e);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchMyPosts(next, true);
  };

  if (initializing) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>

        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div
                key={post._id}
                className="mb-6 bg-white rounded-2xl shadow-md p-4 text-black border border-black"
              >
                {currentUser ? (
                  <PostCard post={post} currentUser={currentUser} setPosts={setPosts} />
                ) : (
                  <div>Loading user…</div>
                )}
              </div>
            ))}

            {hasMore ? (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Load More
                </button>
              </div>
            ) : (
              <p className="text-center mt-6 text-gray-200">No more posts</p>
            )}
          </>
        ) : (
          <p className="text-gray-200">You haven’t created any posts yet.</p>
        )}
      </div>
    </div>
  );
}
