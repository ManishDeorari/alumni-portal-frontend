"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CreatePost from "../components/Post/CreatePost";
import PostCard from "../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../utils/socket";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch(
          "https://alumni-backend-d9k9.onrender.com/api/user/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error("User fetch failed");
        setUser(data);
      } catch (error) {
        console.error("User fetch error:", error.message);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch posts with pagination
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      const res = await fetch(
        `https://alumni-backend-d9k9.onrender.com/api/posts?page=${pageNum}&limit=${limit}`
      );

      const data = await res.json();
      if (!res.ok || !Array.isArray(data.posts)) {
        console.error("❌ Unexpected posts format:", data);
        return;
      }

      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));

      // control "has more"
      const loaded = (append ? posts.length : 0) + data.posts.length;
      setHasMore(loaded < data.total);
    } catch (error) {
      console.error("🔥 Failed to fetch posts:", error.message);
    }
  };

  // load first page
  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  // ✅ Load more handler
  const handleLoadMore = async () => {
    setFetchingMore(true);
    const nextPage = page + 1;
    await fetchPosts(nextPage, true);
    setPage(nextPage);
    setFetchingMore(false);
  };

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.off("postUpdated");
    socket.on("postUpdated", (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    return () => socket.off("postUpdated");
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.off("postCreated");
    socket.on("postCreated", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    return () => socket.off("postCreated");
  }, []);

  useEffect(() => {
    const handler = (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    };

    socket.on("postReacted", handler);
    return () => socket.off("postReacted", handler);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    socket.on("postDeleted", handler);
    return () => socket.off("postDeleted", handler);
  }, []);

  if (loading)
    return <div className="text-center mt-10 text-white">Loading...</div>;

  if (!user)
    return (
      <div className="text-center mt-10 text-red-200">
        User not found or unauthorized.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* USER INFO */}
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

        {/* CREATE POST */}
        <section className="bg-white text-gray-900 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold">📢 Create a Post</h2>
          <CreatePost setPosts={setPosts} currentUser={user} />
        </section>

        {/* POSTS */}
        <section>
          <h2 className="text-xl font-bold mb-4">📰 Latest Posts</h2>
          {Array.isArray(posts) ? (
            posts.length === 0 ? (
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
                      <PostCard
                        post={post}
                        currentUser={user}
                        setPosts={setPosts}
                      />
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
                  <p className="text-center mt-6 text-gray-200">
                    🚫 No more posts
                  </p>
                )}
              </>
            )
          ) : (
            <p className="text-red-500">⚠️ Failed to load posts.</p>
          )}
        </section>
      </main>
    </div>
  );
}
