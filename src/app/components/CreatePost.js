"use client";
import React, { useState } from "react";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    let imageUrl = "";

    try {
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET); // ✅ From .env
        imageData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME); // ✅ From .env

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
          {
            method: "POST",
            body: imageData,
          }
        );

        const cloudinaryJson = await cloudinaryRes.json();
        if (!cloudinaryJson.secure_url) {
          throw new Error("Image upload failed");
        }
        imageUrl = cloudinaryJson.secure_url;
      }

      const token = localStorage.getItem("token");

      const response = await fetch("https://alumni-backend-d9k9.onrender.com/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image: imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const result = await response.json();
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
