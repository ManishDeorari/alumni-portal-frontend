"use client";
import Image from "next/image";
import { Camera, Trash } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./ProfileEditorModal";

export default function ProfileAvatar({ image, onUpload ,userId}) {
  const [showModal, setShowModal] = useState(false);
  //const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profileImage: "" }),
    });
    onUpload(); // <- This will refresh image from parent
  };

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

      {image && (
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-200"
          title="Remove photo"
        >
          <Trash size={16} className="text-red-500" />
        </button>
      )}

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
