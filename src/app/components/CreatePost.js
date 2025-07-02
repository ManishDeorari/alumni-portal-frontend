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

    setLoading(true);
    let imageUrl = "";

    try {
      // 1. Upload to Cloudinary if image exists
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "your_upload_preset"); // Replace with real
        imageData.append("cloud_name", "your_cloud_name"); // Replace with real

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          imageData
        );

        imageUrl = cloudinaryRes.data.secure_url;
      }

      // 2. Post to backend
      const postRes = await axios.post(
        "https://alumni-backend-d9k9.onrender.com/api/posts",
        { content, imageUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 3. Reset
      setContent("");
      setImage(null);
      setPreview(null);
      if (onPostCreated) onPostCreated(postRes.data);
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
