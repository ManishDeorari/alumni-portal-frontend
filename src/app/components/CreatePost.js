"use client";
import React, { useState } from "react";

export default function CreatePost({ setPosts }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return alert("Write something to post!");

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const newPost = await res.json();
      setContent("");
      setPosts((prev) => [newPost, ...prev]); // ✅ Add to top of feed
    } catch (err) {
      console.error("❌ Error creating post:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-gray-800">
      <textarea
        rows={3}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border rounded resize-none focus:outline-none"
      />

      <div className="text-right">
        <button
          onClick={handlePost}
          disabled={loading}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
