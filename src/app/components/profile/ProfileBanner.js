import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal";
import ImageViewerModal from "./ImageViewerModal";
import Image from "next/image";

export default function ProfileBanner({ image, onUpload, userId, isPublicView }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const currentUserRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
  const isRestricted = isPublicView && currentUserRole !== 'admin';

  const bannerImg = image || "/default_banner.jpg";

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      <div className="w-full h-full bg-gray-200 relative">
        <Image
          src={bannerImg}
          alt="Banner"
          fill
          className={`object-cover cursor-pointer ${isRestricted ? 'select-none' : ''}`}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          onClick={() => setShowViewer(true)}
        />
        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setShowViewer(true)}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>

      {!isPublicView && (
        <button
          onClick={() => setShowEditor(true)}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer z-10"
          title="Edit banner"
        >
          <Camera size={20} className="text-gray-700" />
        </button>
      )}

      {showEditor && (
        <BannerEditorModal
          userId={userId}
          currentImage={bannerImg}
          onClose={() => setShowEditor(false)}
          onUploaded={() => {
            setShowEditor(false);
            onUpload();
          }}
        />
      )}

      {showViewer && (
        <ImageViewerModal
          imageUrl={bannerImg}
          onClose={() => setShowViewer(false)}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}
