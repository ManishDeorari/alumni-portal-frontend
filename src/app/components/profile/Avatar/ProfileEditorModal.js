"use client";

import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ProfileImageCropper from "./ProfileImageCropper";
import ProfileImageFilters from "./ProfileImageFilters";
import ProfileImageAdjust from "./ProfileImageAdjust";

export default function ProfileEditorModal({ onClose, onUploaded, userId, currentImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "/default-profile.jpg");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const adjustOriginalRef = useRef({ url: null, file: null });
  const [adjustKey, setAdjustKey] = useState(0); // force remount after reset

  const fileInputRef = useRef();

  // When user selects a new file, store it as the ORIGINAL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🚫 Block GIFs and animated formats
    if (file.type === "image/gif") {
      toast.error("GIFs or animated images are not allowed for profile pictures.");
      e.target.value = null; // reset input
      return;
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);

    // Save original for Reset
    adjustOriginalRef.current = { url, file };
  };

  const handleApplyUpload = async () => {
    if (!selectedFile || !userId) {
      toast.error("Please select a photo first.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      // 🔹 Always fetch the latest profile before upload
      const latestProfileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const latestProfile = await latestProfileRes.json();
      const latestImage = latestProfile?.profilePicture || null;

      // 1️⃣ Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      // Force unique filename to avoid caching issues
      const newPublicId = `user_${userId}_profile_${Date.now()}`;
      formData.append("public_id", newPublicId);

      const uploadRes = await fetch(
        process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL,
        { method: "POST", body: formData }
      );

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.secure_url) {
        toast.error("❌ Upload to Cloudinary failed.");
        return;
      }

      // 2️⃣ Update user profile in backend
      const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileImage: uploadJson.secure_url,
            oldImageUrl:
              latestImage && !latestImage.includes("default-profile.jpg")
                ? latestImage
                : null,
          }),
        }
      );

      if (!backendRes.ok) {
        toast.error("❌ Failed to update profile image in backend.");
        return;
      }

      // 3️⃣ Update local user state instantly
      if (typeof onUploaded === "function") {
        onUploaded(uploadJson.secure_url);
      }

      // 4️⃣ Delete old image from Cloudinary (if exists)
      if (latestImage && !latestImage.includes("default-profile.jpg")) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-old-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl: latestImage }),
        }).catch((err) =>
          console.warn("⚠ Failed to delete old image from Cloudinary:", err)
        );
      }

      toast.success("✅ Profile image updated!");
      setSelectedFile(null);
      setActiveTab(null);
      onClose();
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!userId) return toast.error("No user found.");

    try {
      const token = localStorage.getItem("token");

      // Get the latest profile image before deleting
      const latestProfileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const latestProfile = await latestProfileRes.json();
      const latestImage = latestProfile?.profilePicture || null;

      const defaultImageUrl = "/default-profile.jpg";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileImage: defaultImageUrl,
            oldImageUrl:
              latestImage && !latestImage.includes("default-profile.jpg")
                ? latestImage
                : null,
          }),
        }
      );

      if (!res.ok) {
        return toast.error("Failed to delete photo.");
      }

      // Update UI instantly
      setPreviewUrl(defaultImageUrl);
      if (typeof onUploaded === "function") {
        onUploaded(defaultImageUrl);
      }

      toast.success("✅ Photo deleted and set to default!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      {/* Scrollable white modal box */}
      <div className="bg-white rounded-lg w-[90%] max-w-3xl p-4 relative text-black 
                    max-h-[90vh] overflow-y-auto">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">Profile Image</h2>

        {/* 🖼️ Preview */}
        <div className="flex justify-center mb-4">
          <img
            src={previewUrl || "/default-profile.jpg"}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-full shadow"
          />
        </div>

        {/* Tabs + Reset */}
        <div className="flex justify-around mb-4 border-b pb-2 items-center">
          {["crop", "filters", "adjust"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (!selectedFile) return; // prevent activation if no new image
                setActiveTab(activeTab === tab ? null : tab);
              }}
              disabled={!selectedFile}
              className={`bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded ml-2 font-medium ${activeTab === tab
                  ? "bg-blue-100 text-blue-600"
                  : "text-black-600"
                } ${!selectedFile ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              title={!selectedFile ? "Select a new image first" : `Open ${tab}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}

          {/* Reset Button */}
          {selectedFile && (
            <button
              onClick={() => {
                const { url, file } = adjustOriginalRef.current || {};
                if (url) setPreviewUrl(url);
                if (file) setSelectedFile(file);
                setActiveTab(null);
                setAdjustKey((k) => k + 1); // re-render adjust tool cleanly
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded ml-2 font-medium"
              title="Reset adjustments but keep the selected banner"
            >
              Reset
            </button>
          )}
        </div>

        {/* Subsection */}
        {activeTab && (
          <div className="flex justify-center items-center py-4 px-6 border rounded mb-4 min-h-[160px]">
            {activeTab === "crop" && selectedFile && (
              <ProfileImageCropper
                imageSrc={previewUrl}
                onComplete={(croppedImg) => {
                  setCroppedImage(croppedImg);
                  setPreviewUrl(croppedImg); // immediately update preview
                  fetch(croppedImg)
                    .then((res) => res.blob())
                    .then((blob) =>
                      setSelectedFile(
                        new File([blob], "profile.jpg", { type: blob.type })
                      )
                    );
                }}
              />
            )}

            {activeTab === "filters" && selectedFile && (
              <ProfileImageFilters
                imageSrc={previewUrl}
                onComplete={(img, css) => {
                  // Apply CSS filter directly to preview
                  setPreviewUrl(img);

                  // Instead of creating a new file, just track filter css for upload
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const image = new Image();

                  image.src = img;
                  image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.filter = css; // apply filter here
                    ctx.drawImage(image, 0, 0, image.width, image.height);

                    canvas.toBlob((blob) => {
                      if (blob) {
                        setSelectedFile(new File([blob], "profile_filtered.jpg", { type: blob.type }));
                        setPreviewUrl(URL.createObjectURL(blob)); // update preview with filtered version
                      }
                    }, "image/jpeg");
                  };
                }}
              />
            )}

            {activeTab === "adjust" && selectedFile && (
              <ProfileImageAdjust
                key={adjustKey}              // remount after reset so sliders reset visually
                imageUrl={previewUrl}        // prop name matches child component
                onApply={(url, file) => {
                  setPreviewUrl(url);
                  setSelectedFile(file);
                }}
                onReset={() => {
                  const { url, file } = adjustOriginalRef.current || {};
                  if (url) setPreviewUrl(url);
                  if (file) setSelectedFile(file);

                  // force the child to remount so its internal slider state resets
                  setAdjustKey((k) => k + 1);
                }}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDeletePhoto}
            className="text-red-600 font-medium hover:underline"
            title="Delete your current profile photo and set default"
          >
            Delete Photo
          </button>

          {/* Change Photo ↔ Cancel toggle */}
          {selectedFile ? (
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(currentImage || "/default-profile.jpg");
                setActiveTab(null); // close crop/filters/adjust if open
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
              title="Cancel changes and keep previous photo"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
              title="Select a new photo to change your profile image"
            >
              Change Photo
            </button>
          )}

          <button
            onClick={handleApplyUpload}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded disabled:opacity-50"
            title="Apply all changes and update profile photo"
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