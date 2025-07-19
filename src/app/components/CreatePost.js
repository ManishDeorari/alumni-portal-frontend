"use client";
import React, { useState } from "react";
import { createPost } from "../../api/dashboard";
import toast from "react-hot-toast";
import EmojiPickerToggle from "./EmojiPickerToggle";

const CreatePost = ({ setPosts, currentUser }) => {
  const [content, setContent] = useState("");
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const hasContent = content.trim().length > 0;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError("You can upload up to 6 images.");
      return;
    }
    setImages([...images, ...files]);
    setVideo(null);
    setPreviewVideo(null);
    setError("");
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("❌ Please upload a video smaller than 50MB.");
      e.target.value = "";
      return;
    }
    setVideo(file);
    setPreviewVideo(URL.createObjectURL(file));
    setImages([]);
    setError("");
  }
  e.target.value = "";
};

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasContent) {
      toast.error("❌ Please add a caption or emoji before posting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createPost(content, images, video);

      const newPost = result?.data || result?.post || (Array.isArray(result.posts) ? result.posts[0] : null);

      setContent("");
      setVideo(null);
      setPreviewVideo(null);
      setImages([]);

      if (newPost && setPosts) {
        setPosts(prev => {
          const exists = prev.some((p) => p._id === newPost._id);
          if (exists) return prev;
          return [newPost, ...prev];
        });
        toast.success("🎉 Post uploaded successfully!");
      } else {
        console.warn("❌ Unexpected post format:", result);
        toast.error("❌ Post failed to upload correctly.");
      }
    } catch (err) {
      console.error("Post error:", err);
      toast.error("❌ Post failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow mb-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-2 resize-none"
            rows="3"
          />
          <div className="absolute bottom-[100%] right-0">
            <EmojiPickerToggle
              onEmojiSelect={handleEmojiSelect}
              icon="😀"
              iconSize="text-2xl"
              cursorPositioned={true}
            />
          </div>
        </div>

        <div className="flex gap-4 items-center justify-between mt-2 flex-wrap">
          <label className="cursor-pointer text-blue-600">
            📷 Add Photo
            <input
              type="file"
              accept="image/*"
              multiple
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
            disabled={loading || !hasContent}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition-all ${
              loading || !hasContent
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative w-28 h-28">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${index}`}
                  className="rounded-lg object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = images.filter((_, i) => i !== index);
                    setImages(updated);
                  }}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-1 rounded-full text-xs"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {previewVideo && (
          <div className="relative mt-3 max-h-64">
            <video
              src={previewVideo}
              controls
              className="rounded-lg max-h-64 w-full"
            />
            <button
              type="button"
              onClick={() => {
                setVideo(null);
                setPreviewVideo(null);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm"
            >
              ❌
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
