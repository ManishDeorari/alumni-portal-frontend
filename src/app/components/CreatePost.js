"use client";
import React, { useState } from "react";
import { createPost } from "./dashboard"; // adjust path as needed

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image && !video) return;
    setLoading(true);

    try {
      const result = await createPost(content, image, video);
      setContent("");
      setImage(null);
      setVideo(null);
      setPreviewImage(null);
      setPreviewVideo(null);
      if (onPostCreated) onPostCreated(result);
    } catch (err) {
      console.error("Post error:", err);
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
        <div className="flex gap-4 items-center justify-between mt-2 flex-wrap">
          <label className="cursor-pointer text-blue-600">
            📷 Add Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <label className="cursor-pointer text-purple-600">
            🎥 Add Video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
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

        {/* Media previews */}
        {previewImage && (
          <img
            src={previewImage}
            alt="preview"
            className="mt-3 max-h-64 rounded-lg object-cover"
          />
        )}

        {previewVideo && (
          <video
            src={previewVideo}
            controls
            className="mt-3 max-h-64 rounded-lg"
          />
        )}
      </form>
    </div>
  );
};

export default CreatePost;
