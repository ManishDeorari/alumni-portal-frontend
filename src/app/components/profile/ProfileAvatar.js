"use client";
import { Camera, Trash } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";

export default function ProfileAvatar({ image, onUpload ,userId}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <img
        src={image || "/default-profile.jpg"}
        alt="Profile"
        width={112}
        height={112}
        className="rounded-full border-4 border-white object-cover w-28 h-28"
      />

      <button
        onClick={() => setShowModal(true)}
        className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow cursor-pointer"
        title="Edit photo"
      >
        <Camera size={18} className="text-gray-700" />
      </button>

      {showModal && (
        <ProfileEditorModal
          userId={userId}
          currentImage={image}
          onClose={() => setShowModal(false)}
          onUploaded={() => {
            setShowModal(false);
            onUpload(); // This triggers fetchUser from parent
          }}
        />
      )}
    </div>
  );
}
