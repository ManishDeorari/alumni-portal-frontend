"use client";
import { useState, useEffect, useRef } from "react";

const FILTERS = {
  Original: "none",
  Studio: "brightness(1.1) contrast(1.1)",
  Spotlight: "brightness(1.2) saturate(1.3)",
  Prime: "contrast(1.2) saturate(1.2)",
  Classic: "grayscale(0.6) contrast(1.1)",
  Edge: "contrast(1.4) brightness(0.9)",
  Luminate: "brightness(1.3) saturate(1.1) contrast(1.1)",
};

export default function ProfileImageFilters({ imageSrc, onFilterApplied }) {
  const [selected, setSelected] = useState(null); // no default
  const [cache, setCache] = useState({});
  const originalRef = useRef(null); // store original image once fully loaded
  const originalReady = useRef(false); // flag to ensure original is ready

  // Load original image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          originalRef.current = { dataUrl, file: new File([blob], "original.jpg", { type: blob.type }) };
          originalReady.current = true;
        });
    };
  }, [imageSrc]);

  const applyFilter = (filterName) => {
    setSelected(filterName);

    // Apply Original: always force reset to uploaded image
    if (filterName === "Original") {
      if (!originalReady.current) return; // do nothing if not ready
      onFilterApplied(originalRef.current.dataUrl, originalRef.current.file);
      return;
    }

    // Use cache if available
    if (cache[filterName]) {
      onFilterApplied(cache[filterName].dataUrl, cache[filterName].file);
      return;
    }

    // Apply filter freshly on original
    if (!originalReady.current) return; // safety check
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = originalRef.current.dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.filter = FILTERS[filterName];
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `profile_${filterName}.jpg`, { type: blob.type });
          setCache((prev) => ({ ...prev, [filterName]: { dataUrl, file } }));
          onFilterApplied(dataUrl, file);
        });
    };
  };

  return (
    <div className="flex gap-4 overflow-x-auto w-full justify-center p-2">
      {Object.keys(FILTERS).map((filter) => (
        <div
          key={filter}
          onClick={() => applyFilter(filter)}
          className={`text-center text-xs cursor-pointer ${
            selected === filter ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-500"
          }`}
        >
          <div
            className={`w-16 h-16 rounded mb-1 mx-auto shadow overflow-hidden border-2 ${
              selected === filter ? "border-blue-500" : "border-transparent"
            }`}
          >
            <img
              src={imageSrc} // static thumbnails
              alt={filter}
              className="w-full h-full object-cover"
              style={{ filter: FILTERS[filter] }}
            />
          </div>
          {filter === "Original" ? "Reset to Original" : filter}
        </div>
      ))}
    </div>
  );
}
