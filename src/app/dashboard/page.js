"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar"; // <-- Admin sidebar
import CreatePost from "../components/Post/CreatePost";
import PostCard from "../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../utils/socket";

import PointsScenario from "../components/dashboard/PointsScenario";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { darkMode } = useTheme();
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
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      let url = `${API_URL}/api/posts?page=${pageNum}&limit=${limit}`;
      let headers = {};

      if (activeTab === "my") {
        url = `${API_URL}/api/posts/me?page=${pageNum}&limit=${limit}`;
        headers = { Authorization: `Bearer ${token}` };
      } else {
        const queryType = activeTab === "all" ? "Regular" : activeTab;
        url += `&type=${queryType}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.posts)) return;

      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      // Use data.posts directly for calculation to avoid stale closure issues
      setHasMore(data.posts.length === limit);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    }
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [activeTab, fetchPosts]);

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
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-b from-blue-600 to-purple-700 text-white relative`}>
      <SidebarComponent />

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column - Points Scenario Widget - Hidden on mobile or pushed down */}
          <aside className="lg:w-80 order-2 lg:order-1 relative">
            <div className="lg:fixed lg:top-24 lg:w-80 z-40">
              <PointsScenario darkMode={darkMode} />
            </div>
          </aside>

          {/* Right Column - Feed & Welcome */}
          <div className="flex-1 space-y-8 order-1 lg:order-2">
            {/* User info */}
            <section className={`${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"} p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-colors duration-500`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl md:text-4xl">👋</span>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className={`text-2xl md:text-3xl font-black ${darkMode ? "text-white" : "text-gray-900"} tracking-tight mb-1`}>
                    Welcome back, {user?.name || "Alumni"}!
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-4 mt-2">
                    <span className={`text-[9px] md:text-[10px] ${darkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"} px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest`}>{user?.enrollmentNumber || "N/A"}</span>
                    <span className={`text-[9px] md:text-[10px] ${darkMode ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"} px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest`}>{user?.role || "Member"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Create Post */}
            <section className="transition-all duration-500">
              <CreatePost setPosts={setPosts} currentUser={user} darkMode={darkMode} />
            </section>

            {/* Feed Subsections Tabs */}
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { id: "all", label: "All Posts" },
                { id: "my", label: "My Posts" },
                { id: "Session", label: "Session" },
                { id: "Announcement", label: "Announcement" },
                { id: "Event", label: "Event" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                    ? "bg-white text-blue-700 shadow-xl scale-105"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* New Posts Notification */}
            <AnimatePresence>
              {pendingPosts.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex justify-center mt-6 mb-2 relative z-[500]"
                >
                  <button
                    onClick={loadPendingPosts}
                    className="relative z-[501] bg-yellow-400 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3 animate-bounce"
                  >
                    ✨ {pendingPosts.length} New Post{pendingPosts.length > 1 ? "s" : ""}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts */}
            <section className="space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-200">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                    {activeTab === "my" ? "You haven't posted anything yet." : "No posts found in this category."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                      <div key={post._id}>
                        <PostCard post={post} currentUser={user} setPosts={setPosts} darkMode={darkMode} />
                      </div>
                    ))}
                  </div>

                  {hasMore && activeTab === "all" ? (
                    <div className="text-center mt-12 pb-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={fetchingMore}
                        className="px-12 py-4 bg-white text-blue-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-50 hover:shadow-2xl transition-all disabled:opacity-50 shadow-xl active:scale-95"
                      >
                        {fetchingMore ? "Loading..." : "Load More Posts"}
                      </button>
                    </div>
                  ) : (
                    activeTab === "all" && (
                      <div className="text-center py-12 opacity-40">
                        <p className="text-xs font-black uppercase tracking-[0.3em]">✨ End of the Feed ✨</p>
                      </div>
                    )
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

