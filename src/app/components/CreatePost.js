"use client";
import React, { useState } from "react";
import axios from "axios";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!content.trim() && !image) return;

  setLoading(true);
  let imageUrl = "";

  try {
    // 1. Upload to Cloudinary if image exists
    if (image) {
      const imageData = new FormData();
      imageData.append("file", image);
      imageData.append("upload_preset", "your_upload_preset"); // ✅ Replace
      imageData.append("cloud_name", "your_cloud_name");       // ✅ Replace

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", // ✅ Replace
        {
          method: "POST",
          body: imageData,
        }
      );

      const cloudinaryJson = await cloudinaryRes.json();
      imageUrl = cloudinaryJson.secure_url;
    }

    // 2. Post to backend using token in header
    const token = localStorage.getItem("token");

    const response = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Use token in header
      },
      body: JSON.stringify({ content, imageUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const result = await response.json();

    // 3. Reset
    setContent("");
    setImage(null);
    setPreview(null);
    if (onPostCreated) onPostCreated(result);
  } catch (err) {
    console.error("Post failed:", err);
    alert("Post failed. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white rounded-2xl p-4 shadow mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-2 resize-none"
          rows="3"
        />
        <div className="flex items-center justify-between mt-2">
          <label className="cursor-pointer text-blue-600">
            📷 Add Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-2 max-h-64 rounded-lg object-cover"
          />
        )}
      </form>
    </div>
  );
};

export default CreatePost;
