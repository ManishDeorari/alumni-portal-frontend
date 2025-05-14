import React, { useState } from "react";
import axios from "axios";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContent("");
      setImage(null);
      setPreview(null);
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post");
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
