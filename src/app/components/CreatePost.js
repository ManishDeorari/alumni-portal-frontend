"use client";
import React, { useState } from "react";
import { createPost } from "../../api/dashboard"; // adjust path as needed
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect } from "react";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [video, setVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError("You can upload up to 6 images.");
      return;
    }
    setError("");
    setImages([...images, ...files]);
    setVideo(null); // Disable video if images selected
    setPreviewVideo(null);
  };

  const handleVideoChange = (e) => {
    setImages([]); // Clear images
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
    setError("");
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  const emojiRef = useRef();
  const emojiButtonRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && !video) {
      setError("Post must contain text, image, or video.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createPost(content, images, video);
      setContent("");
      setVideo(null);
      setPreviewVideo(null);
      setImages([]);
      toast.success("🎉 Post uploaded successfully!");
      onPostCreated?.(result); // Notify parent
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
        {/* Emoji Toggle Button */}
        <button
          type="button"
          ref={emojiButtonRef}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-2xl mt-1"
        >
          😀
        </button>

          {/* Animated Picker near the icon */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                key="emoji-picker"
                ref={emojiRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2"
              >
                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </motion.div>
            )}
          </AnimatePresence>

        {showEmojiPicker && (
          <div className="mt-2 relative z-10" ref={emojiRef}>
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}

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
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Media Previews */}
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
