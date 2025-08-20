"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal";

export default function ProfileBanner({ image, onUpload, userId }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      {/* Banner preview */}
      <div className="w-full h-full bg-gray-200">
        <img
          src={image || "/default_banner.jpg"}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Edit button */}
      <button
        onClick={() => {
          console.log("Button clicked");
          setShowModal(true);
        }}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer z-10"
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
