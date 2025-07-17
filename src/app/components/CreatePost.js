"use client";
import React, { useState } from "react";
import { createPost } from "../../api/dashboard"; // adjust path as needed
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError("You can upload up to 6 images");
      return;
    }
    setError("");
    setImages([...images, ...files]);
    setVideo(null); // Disable video if images selected
  };

  const handleVideoChange = (e) => {
    setImages([]); // Clear images
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image && !video) {
      setError("Post must contain text, image, or video.");
      return;
  }
    setLoading(true);

    try {
      const result = await createPost(content, image, video);
      setContent("");
      setImage(null);
      setVideo(null);
      setPreviewImage(null);
      setPreviewVideo(null);
      if (onPostCreated) onPostCreated(result);
      toast.success("🎉 Post uploaded successfully!");
      setContent("");           // Reset text input
      setImage(null);           // Reset image
      setVideo(null);           // Reset video
      setPreviewImage(null);    // Reset preview
      setPreviewVideo(null);    // Reset preview
      onPostCreated?.(newPost); // refresh feed
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-2 resize-none"
          rows="3"
        />
        {showEmojiPicker && (
          <div className="mt-2">
            <Picker onSelect={handleEmojiSelect} />
          </div>
        )}
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
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-sm text-yellow-500"
          >
            😊 Emoji
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>

        </div>

        {/* Media previews */}
        {previewImage && (
          <div className="relative mt-3 max-h-64">
            <img
              src={previewImage}
              alt="preview"
              className="rounded-lg object-cover max-h-64 w-full"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreviewImage(null);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm"
            >
              ❌
            </button>
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
