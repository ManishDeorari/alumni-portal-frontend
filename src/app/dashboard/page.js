"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

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
        console.warn("⛔ No token found. Redirecting...");
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
        console.log("✅ User fetched:", data);

        if (!response.ok || !data.user) {
          throw new Error("User fetch failed or user not returned");
        }

        setUser(data.user);
      } catch (error) {
        console.error("User fetch error:", error.message);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts");
        const data = await res.json();
        console.log("📨 Posts fetched:", data);
        setPosts(data);
      } catch (error) {
        console.error("❌ Failed to load posts", error);
      }
    };
    fetchPosts();
  }, []);

  // ✅ Loading & Error State UI
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user)
    return (
      <div className="text-center mt-10 text-red-500">
        User not found or unauthorized.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Alumni Dashboard</h1>
        <div className="flex items-center space-x-4">
          <img
            src={user?.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span>{user?.fullName || "No Name"}</span>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* USER WELCOME */}
        <section className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Welcome, {user?.fullName || "Alumni"}
          </h2>
          <p className="text-sm text-gray-700">
            Your enrollment number:{" "}
            <strong>{user?.enrollmentNumber || "N/A"}</strong>
          </p>
          <p className="text-sm text-gray-700">
            Email: <strong>{user?.email || "N/A"}</strong>
          </p>
        </section>

        {/* DASHBOARD LINKS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/profile">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">👤 My Profile</h3>
              <p className="text-sm text-gray-600 mt-1">
                View and manage your profile
              </p>
            </div>
          </Link>
          <Link href="/dashboard/posts">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">📝 Posts</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create and view alumni posts
              </p>
            </div>
          </Link>
          <Link href="/dashboard/network">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">🌐 Network</h3>
              <p className="text-sm text-gray-600 mt-1">
                Connect with other alumni
              </p>
            </div>
          </Link>
          <Link href="/dashboard/messages">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">💬 Messages</h3>
              <p className="text-sm text-gray-600 mt-1">Chat with connections</p>
            </div>
          </Link>
          <Link href="/dashboard/points">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">🏆 Points & Awards</h3>
              <p className="text-sm text-gray-600 mt-1">
                Track your profile score
              </p>
            </div>
          </Link>
          <Link href="/">
            <div className="bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-md">🔙 Home</h3>
              <p className="text-sm text-gray-600 mt-1">Back to homepage</p>
            </div>
          </Link>
        </section>

        {/* CREATE + DISPLAY POSTS */}
        <section className="max-w-2xl mx-auto w-full space-y-4">
          <h2 className="text-xl font-bold">📢 Create a Post</h2>
          <CreatePost setPosts={setPosts} currentUser={user} />

          <h2 className="text-xl font-bold mt-6">📰 Latest Posts</h2>
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                setPosts={setPosts}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
