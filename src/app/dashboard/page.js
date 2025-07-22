"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/Post/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../utils/socket";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts");
        const { posts, total } = await res.json();
        console.log("📦 Posts fetched:", posts, "Total:", total);

        if (Array.isArray(posts)) {
          setPosts(posts);
        } else {
          console.error("❌ Unexpected posts format:", posts);
          setPosts([]); // fallback
        }
      } catch (error) {
        console.error("🔥 Failed to fetch posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  // ✅ Setup socket for post updates
  useEffect(() => {
    if (!socket) return;

    socket.off("postUpdated");
    socket.on("postUpdated", (updatedPost) => {
      console.log("✅ Socket postUpdated:", updatedPost);
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    return () => socket.off("postUpdated");
  }, []);

  // ✅ Setup socket for new post creation
  useEffect(() => {
    if (!socket) return;

    socket.off("postCreated");
    socket.on("postCreated", (newPost) => {
      console.log("🆕 Socket postCreated:", newPost);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    return () => socket.off("postCreated");
  }, []);

useEffect(() => {
  const handler = ({ postId, userId, isLiked }) => {
    console.log("💥 postLiked socket received:", { postId, userId, isLiked });

    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: isLiked
                ? [...new Set([...p.likes, userId])]
                : p.likes.filter((id) => id !== userId),
            }
          : p
      )
    );
  };

  socket.on("postLiked", handler);
  return () => socket.off("postLiked", handler);
}, []);s

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
        <section className="bg-white text-gray-900 p-6 rounded-xl shadow-md space-y-6">
          <h2 className="text-xl font-bold">📰 Latest Posts</h2>
          {Array.isArray(posts) ? (
            posts.length === 0 ? (
              <p className="text-center text-gray-500">No posts yet.</p>
            ) : (
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard
                      post={post}
                      currentUser={user}
                      setPosts={setPosts}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )
          ) : (
            <p className="text-red-500">⚠️ Failed to load posts.</p>
          )}
        </section>
      </main>
    </div>
  );
}
