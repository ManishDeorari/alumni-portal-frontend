// components/Post/ImageGallery.js
import React from "react";

export default function ImageGallery({ images, onImageClick }) {
  if (!images?.length) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto max-w-full">
      {images.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`image-${index}`}
          className="h-48 w-auto rounded-lg border cursor-pointer object-contain"
          onClick={() => onImageClick(index)} // ✅ pass index instead of URL
        />
      ))}
    </div>
  );
}
