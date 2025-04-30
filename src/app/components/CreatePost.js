"use client";
import { useState } from "react";
import { createPost } from "@/api/dashboard";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      await createPost(content);
      setContent("");
      window.location.reload(); // Refresh post feed after posting
    } catch (err) {
      console.error("❌ Post creation failed:", err.message);
      alert("Failed to post. Try again.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black rounded-lg shadow p-4 mb-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full h-20 p-2 rounded border focus:outline-none resize-none"
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
