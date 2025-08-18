"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal"; // we will create this

export default function ProfileBanner({ image, onUpload, userId }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      {/* Banner preview */}
      <img
        src={image || "/default-banner.jpg"}
        alt="Banner"
        className="w-full h-full object-cover"
      />

      {/* Edit button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer"
        title="Edit banner"
      >
        <Camera size={20} className="text-gray-700" />
      </button>

      {/* Modal */}
      {showModal && (
        <BannerEditorModal
          userId={userId}
          currentImage={image}
          onClose={() => setShowModal(false)}
          onUploaded={() => {
            setShowModal(false);
            onUpload(); // refresh banner from parent
          }}
        />
      )}
    </div>
  );
}
