"use client";
import { X } from "lucide-react";

export default function ImageViewerModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2"
      >
        <X className="text-white" size={28} />
      </button>

      {/* Full image */}
      <img
        src={imageUrl}
        alt="Full view"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
      />
    </div>
  );
}
