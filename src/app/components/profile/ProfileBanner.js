import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal";
import ImageViewerModal from "./ImageViewerModal";

export default function ProfileBanner({ image, onUpload, userId }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const bannerImg = image || "/default_banner.jpg";

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      <div className="w-full h-full bg-gray-200">
        <img
          src={bannerImg}
          alt="Banner"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowViewer(true)}
        />
      </div>

      <button
        onClick={() => setShowEditor(true)}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer z-10"
        title="Edit banner"
      >
        <Camera size={20} className="text-gray-700" />
      </button>

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
        <ImageViewerModal imageUrl={bannerImg} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}
