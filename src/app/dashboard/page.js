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
      const loaded = (append ? posts.length : 0) + data.posts.length;
      setHasMore(loaded < data.total);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    }
  }, [activeTab, posts.length]);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white relative">
      <SidebarComponent />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column - Points Scenario Widget */}
          <aside className="lg:w-1/4 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <PointsScenario />
            </div>
          </aside>

          {/* Right Column - Feed & Welcome */}
          <div className="flex-1 lg:w-3/4 space-y-10 order-1 lg:order-2">
            {/* User info */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-4xl">👋</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                    Welcome back, {user?.name || "Alumni"}!
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="text-[10px] bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-gray-500 font-black uppercase tracking-widest">{user?.enrollmentNumber || "N/A"}</span>
                    <span className="text-[10px] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-600 font-black uppercase tracking-widest">{user?.role || "Member"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Create Post */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                <span className="bg-blue-50 p-2 rounded-xl">📢</span>
                Create a Post
              </h2>
              <CreatePost setPosts={setPosts} currentUser={user} />
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
                  className="flex justify-center overflow-hidden"
                >
                  <button
                    onClick={loadPendingPosts}
                    className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3 animate-bounce"
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
                  <AnimatePresence mode="popLayout">
                    {filteredPosts.map((post) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm hover:border-gray-300 transition-all group"
                      >
                        <PostCard post={post} currentUser={user} setPosts={setPosts} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

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

