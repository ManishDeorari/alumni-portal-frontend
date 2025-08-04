"use client";

import { X, RotateCcw, RotateCw } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ProfileEditorModal({ onClose, onUploaded, userId, currentImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "/default-profile.jpg");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const fileInputRef = useRef();

  // Handle new file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Apply (Upload + Update + Delete old)
  const handleApplyUpload = async () => {
    if (!selectedFile || !userId) {
      toast.error("Please select a photo first.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const newPublicId = `user_${userId}_profile`;
    formData.append("public_id", newPublicId);

    try {
      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.secure_url) {
        toast.error("❌ Upload to Cloudinary failed.");
        return;
      }

      const token = localStorage.getItem("token");

      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImage: uploadJson.secure_url,
          oldImageUrl:
            currentImage && !currentImage.includes("default-profile.jpg") ? currentImage : null,
        }),
      });

      if (!backendRes.ok) {
        toast.error("❌ Failed to update profile image in backend.");
        return;
      }

      toast.success("✅ Profile image updated!");
      onUploaded(); // Refresh across app
      setSelectedFile(null);
      setActiveTab(null);
      onClose(); // Close the modal
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90%] max-w-3xl p-4 relative text-black">
        {/* ❌ Close Button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black">
          <X />
        </button>

        {/* 📸 Title */}
        <h2 className="text-lg font-semibold mb-4 text-center">Profile Image</h2>

        {/* 🖼️ Image Preview */}
        <div className="flex justify-center mb-4">
          <img
            src={previewUrl || "/default-profile.jpg"}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-full shadow"
          />
        </div>

        {/* 🔧 Top Row: Crop / Filters / Adjust */}
        <div className="flex justify-around mb-4 border-b pb-2">
          <button
            onClick={() => setActiveTab(activeTab === "crop" ? null : "crop")}
            className={`px-4 py-1 rounded font-medium ${
              activeTab === "crop" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            Crop
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "filters" ? null : "filters")}
            className={`px-4 py-1 rounded font-medium ${
              activeTab === "filters" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            Filters
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "adjust" ? null : "adjust")}
            className={`px-4 py-1 rounded font-medium ${
              activeTab === "adjust" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            Adjust
          </button>
        </div>

        {/* 🧰 Subsection Preview */}
        {activeTab && (
          <div className="flex justify-center items-center py-4 px-6 border rounded mb-4 min-h-[160px]">
            {activeTab === "crop" && (
              <div className="flex justify-between w-full gap-6">
                <div className="flex flex-col gap-4 w-3/4">
                  <div>
                    <label className="text-sm font-medium">Zoom</label>
                    <input type="range" min="1" max="3" step="0.1" className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Straighten</label>
                    <input type="range" min="-45" max="45" step="1" className="w-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 justify-center items-center w-1/4">
                  <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <RotateCcw size={20} />
                  </button>
                  <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <RotateCw size={20} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "filters" && (
              <div className="flex gap-4 overflow-x-auto w-full justify-center">
                {["Original", "Studio", "Spotlight", "Prime", "Classic", "Edge", "Luminate"].map(
                  (filter) => (
                    <div
                      key={filter}
                      className="text-center text-xs text-gray-700 cursor-pointer hover:text-blue-600"
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded mb-1 mx-auto shadow" />
                      {filter}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === "adjust" && (
              <div className="w-full px-6 space-y-3">
                {["Brightness", "Contrast", "Saturation", "Vignette"].map((adj) => (
                  <div key={adj}>
                    <label className="text-sm font-medium">{adj}</label>
                    <input type="range" min="-100" max="100" step="1" className="w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📥 Bottom Row: Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button className="text-red-600 font-medium hover:underline">Delete Photo</button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
          >
            Change Photo
          </button>

          <button
            onClick={handleApplyUpload}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            {uploading ? "Applying..." : "Apply"}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
