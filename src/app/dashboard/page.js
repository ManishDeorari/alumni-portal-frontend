"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar"; // <-- Admin sidebar
import CreatePost from "../components/Post/CreatePost";
import PostCard from "../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../utils/socket";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // ✅ Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const res = await fetch(
          "https://alumni-backend-d9k9.onrender.com/api/user/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error("User fetch failed");
        setUser(data);
      } catch (err) {
        console.error("User fetch error:", err.message);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch posts
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts?page=${pageNum}&limit=${limit}`
      );
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.posts)) return;

      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      const loaded = (append ? posts.length : 0) + data.posts.length;
      setHasMore(loaded < data.total);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    }
  };

  useEffect(() => { fetchPosts(1, false); }, []);

  // Load more
  const handleLoadMore = async () => {
    setFetchingMore(true);
    const nextPage = page + 1;
    await fetchPosts(nextPage, true);
    setPage(nextPage);
    setFetchingMore(false);
  };

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const updatePost = (updatedPost) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );

    const addPost = (newPost) => setPosts((prev) => [newPost, ...prev]);
    const removePost = ({ postId }) =>
      setPosts((prev) => prev.filter((p) => p._id !== postId));

    socket.on("postUpdated", updatePost);
    socket.on("postCreated", addPost);
    socket.on("postReacted", updatePost);
    socket.on("postDeleted", removePost);

    return () => {
      socket.off("postUpdated", updatePost);
      socket.off("postCreated", addPost);
      socket.off("postReacted", updatePost);
      socket.off("postDeleted", removePost);
    };
  }, []);

  if (loading) return "Loading...";

  if (!user) return "User not found or unauthorized.";

  // ✅ Choose sidebar based on role
  const SidebarComponent = user.isAdmin ? AdminSidebar : Sidebar;

  console.log("User role:", user.isAdmin);
  //console.log("Fetched user:", data);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <SidebarComponent />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* User info */}
        <section className="bg-white text-gray-900 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {user?.fullName || "Alumni"}
          </h2>
          <p className="text-sm">
            Enrollment Number: <strong>{user?.enrollmentNumber || "N/A"}</strong>
          </p>
          <p className="text-sm">
            Email: <strong>{user?.email || "N/A"}</strong>
          </p>
        </section>

        {/* Create Post */}
        <section className="bg-white text-gray-900 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold">📢 Create a Post</h2>
          <CreatePost setPosts={setPosts} currentUser={user} />
        </section>

        {/* Posts */}
        <section>
          <h2 className="text-xl font-bold mb-4">📰 Latest Posts</h2>
          {posts.length === 0 ? (
            <p className="text-center text-gray-200">No posts yet.</p>
          ) : (
            <>
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 bg-white text-gray-900 p-6 rounded-xl shadow-md"
                  >
                    <PostCard post={post} currentUser={user} setPosts={setPosts} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {hasMore ? (
                <div className="text-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={fetchingMore}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {fetchingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              ) : (
                <p className="text-center mt-6 text-gray-200">🚫 No more posts</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
