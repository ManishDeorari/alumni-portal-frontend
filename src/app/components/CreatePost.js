"use client";

import React, { useState } from "react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return alert("Please write something before posting.");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        window.location.reload(); // refresh to see new post
      } else {
        alert("❌ Failed to create post");
      }
    } catch (err) {
      console.error("❌ Post error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow space-y-2">
      <textarea
        rows="3"
        placeholder="Share your thoughts with alumni..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded focus:outline-none"
      />
      <button
        onClick={handlePost}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
