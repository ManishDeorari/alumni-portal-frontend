import { Camera } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";
import ImageViewerModal from "./ImageViewerModal"; // import here
import Image from "next/image";

export default function ProfileAvatar({ image, onUpload, userId, isPublicView }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const profileImg = image || "/default-profile.jpg";

  return (
    <div className="relative">
      <Image
        src={profileImg}
        alt="Profile"
        width={112}
        height={112}
        onClick={() => setShowViewer(true)} // open full view
        className="rounded-full border-4 border-white object-cover w-28 h-28 cursor-pointer"
      />

      {!isPublicView && (
        <button
          onClick={() => setShowEditor(true)}
          className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow cursor-pointer"
          title="Edit photo"
        >
          <Camera size={18} className="text-gray-700" />
        </button>
      )}

      {showEditor && (
        <ProfileEditorModal
          userId={userId}
          currentImage={profileImg}
          onClose={() => setShowEditor(false)}
          onUploaded={() => {
            setShowEditor(false);
            onUpload();
          }}
        />
      )}

      {showViewer && (
        <ImageViewerModal imageUrl={profileImg} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}
