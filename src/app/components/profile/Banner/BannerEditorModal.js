"use client";

import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import BannerImageCropper from "./BannerImageCropper";
import BannerImageFilters from "./BannerImageFilters";
import BannerImageAdjust from "./BannerImageAdjust";

export default function BannerEditorModal({ onClose, onUploaded, userId, currentImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "/default_banner.jpg");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const adjustOriginalRef = useRef({ url: null, file: null });
  const [adjustKey, setAdjustKey] = useState(0);


  const fileInputRef = useRef();

  // When user selects a new file, store it as the ORIGINAL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🚫 Block GIFs and animated formats
    if (file.type === "image/gif") {
      toast.error("GIFs or animated images are not allowed for banners.");
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
      toast.error("Please select a banner image first.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      // Fetch latest profile to get current banner
      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestBanner = latestProfile?.bannerImage || null;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const newPublicId = `user_${userId}_banner_${Date.now()}`;
      formData.append("public_id", newPublicId);

      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || !uploadJson.secure_url) {
        toast.error("❌ Upload to Cloudinary failed.");
        return;
      }

      // Update backend (bannerImage field)
      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bannerImage: uploadJson.secure_url,
          oldImageUrl: latestBanner && !latestBanner.includes("default_banner.jpg") ? latestBanner : null,
        }),
      });

      if (!backendRes.ok) {
        toast.error("❌ Failed to update banner in backend.");
        return;
      }

      if (typeof onUploaded === "function") onUploaded(uploadJson.secure_url);

      // Optional: delete old Cloudinary banner
      if (latestBanner && !latestBanner.includes("default_banner.jpg")) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-old-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageUrl: latestBanner }),
        }).catch((err) => console.warn("⚠ Failed to delete old banner:", err));
      }

      toast.success("✅ Banner updated!");
      setSelectedFile(null);
      setActiveTab(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!userId) return toast.error("No user found.");

    try {
      const token = localStorage.getItem("token");

      const latestProfileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestProfile = await latestProfileRes.json();
      const latestBanner = latestProfile?.bannerImage || null;

      const defaultBannerUrl = "/default_banner.jpg";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bannerImage: defaultBannerUrl, oldImageUrl: latestBanner && !latestBanner.includes("default-banner.jpg") ? latestBanner : null }),
      });

      if (!res.ok) return toast.error("Failed to delete banner.");

      setPreviewUrl(defaultBannerUrl);
      if (typeof onUploaded === "function") onUploaded(defaultBannerUrl);
      toast.success("✅ Banner deleted and set to default!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl p-4 relative text-black max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black">
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">Banner Image</h2>

        <div className="flex justify-center mb-4 w-full h-[192px] relative rounded-lg overflow-hidden shadow">
          <Image
            src={previewUrl || currentImage || "/default_banner.jpg"}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>

        {/* Tabs + Reset */}
        <div className="flex justify-around mb-4 border-b pb-2 items-center">
          {["crop", "filters", "adjust"].map((tab) => (
            <button
              key={tab}
              onClick={() => { if (!selectedFile) return; setActiveTab(activeTab === tab ? null : tab); }}
              disabled={!selectedFile}
              className={`bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded ml-2 font-medium ${activeTab === tab ? "bg-blue-100 text-blue-600" : "text-black-600"} ${!selectedFile ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              title={!selectedFile ? "Select a new banner first" : `Open ${tab}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}

          {/* Reset Button */}
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
        </div>

        {/* Subsection */}
        {activeTab && (
          <div className="flex justify-center items-center py-4 px-6 border rounded mb-4 min-h-[160px] w-full">
            {activeTab === "crop" && selectedFile && (
              <BannerImageCropper
                imageSrc={previewUrl}
                onComplete={(croppedImg) => {
                  setPreviewUrl(croppedImg);
                  fetch(croppedImg)
                    .then((res) => res.blob())
                    .then((blob) =>
                      setSelectedFile(
                        new File([blob], "banner.jpg", { type: blob.type })
                      )
                    );
                }}
                aspectRatio={16 / 5}
              />
            )}

            {activeTab === "filters" && selectedFile && (
              <BannerImageFilters
                imageSrc={previewUrl}
                onComplete={(img, css) => {
                  setPreviewUrl(img);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const image = new Image();
                  image.src = img;
                  image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.filter = css;
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        setSelectedFile(
                          new File([blob], "banner_filtered.jpg", {
                            type: blob.type,
                          })
                        );
                        setPreviewUrl(URL.createObjectURL(blob));
                      }
                    }, "image/jpeg");
                  };
                }}
              />
            )}

            {activeTab === "adjust" && selectedFile && (
              <BannerImageAdjust
                key={adjustKey}
                imageUrl={previewUrl}
                onApply={(url, file) => {
                  setPreviewUrl(url);
                  setSelectedFile(file);
                }}
                onReset={() => {
                  const { url, file } = adjustOriginalRef.current || {};
                  if (url) setPreviewUrl(url);
                  if (file) setSelectedFile(file);
                  setAdjustKey((k) => k + 1);
                }}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDeleteBanner}
            className="text-red-600 font-medium hover:underline"
            title="Delete current banner and set default"
          >
            Delete Banner
          </button>

          {selectedFile ? (
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(currentImage || "/default_banner.jpg");
                setActiveTab(null);
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
              title="Cancel changes and keep previous banner"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
              title="Select a new banner to change"
            >
              Change Banner
            </button>
          )}

          <button
            onClick={handleApplyUpload}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded disabled:opacity-50"
            title="Apply all changes and update banner"
          >
            {uploading ? "Applying..." : "Apply"}
          </button>
        </div>

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
