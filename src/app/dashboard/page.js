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

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Feed Tabs & Pending Posts
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const [pendingPosts, setPendingPosts] = useState([]);

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
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/me`,
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
      let queryType = "Regular";
      if (activeTab === "my") queryType = "all";
      else if (activeTab !== "all") queryType = activeTab;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/posts?page=${pageNum}&limit=${limit}&type=${queryType}`
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

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [activeTab]);

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
    if (!socket || !user) return;

    const updatePost = (updatedPost) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );

    const addPost = (newPost) => {
      // If it's the current user's post, add it immediately
      if (newPost.user?._id === user._id) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        // Otherwise, add it to pending posts
        setPendingPosts((prev) => [newPost, ...prev]);
      }
    };

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
  }, [user]);

  const loadPendingPosts = () => {
    setPosts((prev) => [...pendingPosts, ...prev]);
    setPendingPosts([]);
  };

  // Filtering posts based on active tab
  const filteredPosts = activeTab === "my"
    ? posts.filter(p => p.user?._id === user?._id)
    : posts;

  if (loading) return "Loading...";

  if (!user) return "User not found or unauthorized.";

  // ✅ Choose sidebar based on role
  const SidebarComponent = user.isAdmin ? AdminSidebar : Sidebar;

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

        {/* Feed Subsections Tabs */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeTab === "all"
              ? "bg-white text-blue-700 shadow-lg scale-105"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeTab === "my"
              ? "bg-white text-blue-700 shadow-lg scale-105"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("Session")}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeTab === "Session"
              ? "bg-white text-blue-700 shadow-lg scale-105"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
          >
            Session
          </button>
          <button
            onClick={() => setActiveTab("Announcement")}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeTab === "Announcement"
              ? "bg-white text-blue-700 shadow-lg scale-105"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
          >
            Announcement
          </button>
          <button
            onClick={() => setActiveTab("Event")}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeTab === "Event"
              ? "bg-white text-blue-700 shadow-lg scale-105"
              : "bg-white/20 text-white hover:bg-white/30"
              }`}
          >
            Event
          </button>
        </div>

        {/* New Posts Notification */}
        <AnimatePresence>
          {pendingPosts.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex justify-center overflow-hidden"
            >
              <button
                onClick={loadPendingPosts}
                className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                ✨ {pendingPosts.length} New Post{pendingPosts.length > 1 ? "s" : ""}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <section>
          {filteredPosts.length === 0 ? (
            <p className="text-center text-gray-200 mt-10 italic">
              {activeTab === "my" ? "You haven't posted anything yet." : "No posts yet."}
            </p>
          ) : (
            <>
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 bg-white text-gray-900 p-6 rounded-xl shadow-md"
                  >
                    <PostCard post={post} currentUser={user} setPosts={setPosts} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {hasMore && activeTab === "all" ? (
                <div className="text-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={fetchingMore}
                    className="px-6 py-2 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-all disabled:opacity-50 shadow-md"
                  >
                    {fetchingMore ? "Loading..." : "View More Posts"}
                  </button>
                </div>
              ) : (
                activeTab === "all" && <p className="text-center mt-10 text-white/60">✨ You've reached the end ✨</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

