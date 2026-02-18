"use client";
import { X } from "lucide-react";
import Image from "next/image";

export default function ImageViewerModal({ imageUrl, onClose, isRestricted }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 z-20"
      >
        <X className="text-white" size={28} />
      </button>

      {/* Full image container */}
      <div className="relative h-[90vh] w-[90vw] overflow-hidden rounded-lg shadow-lg">
        <Image
          src={imageUrl}
          alt="Full view"
          fill
          className={`object-contain ${isRestricted ? 'select-none' : ''}`}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
        />

        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  );
}
