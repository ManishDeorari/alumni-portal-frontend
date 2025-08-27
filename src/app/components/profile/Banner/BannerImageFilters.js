import React, { useState, useRef, useEffect } from "react";

const filters = [
  { name: "Original", css: "none" },
  { name: "Grayscale", css: "grayscale(100%)" },
  { name: "Sepia", css: "sepia(100%)" },
  { name: "Contrast", css: "contrast(150%)" },
  { name: "Brightness", css: "brightness(120%)" },
  { name: "Hue Rotate", css: "hue-rotate(90deg)" },
  { name: "Invert", css: "invert(100%)" },
  { name: "Saturate", css: "saturate(200%)" },
];

export default function BannerImageFilters({ imageSrc, onComplete }) {
  const [tempFilter, setTempFilter] = useState("Original");
  const originalImageRef = useRef(null);

  useEffect(() => {
    if (imageSrc && !originalImageRef.current) {
      originalImageRef.current = imageSrc;
    }
  }, [imageSrc]);

  const handleApply = () => {
    const css = filters.find((f) => f.name === tempFilter)?.css || "none";
    if (onComplete) {
      onComplete(imageSrc, css);
    }
  };

  const handleReset = () => {
    setTempFilter("Original");
    if (onComplete && originalImageRef.current) {
      onComplete(originalImageRef.current, "none");
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Preview */}
      <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border-2 border-gray-300">
        <img
          src={imageSrc}
          alt="Preview"
          className="w-full h-full object-cover"
          style={{
            filter: filters.find((f) => f.name === tempFilter)?.css || "none",
          }}
        />
      </div>

      {/* Filters Thumbnails */}
      <div className="flex gap-4 flex-wrap justify-center mb-4">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setTempFilter(filter.name)}
            className={`flex flex-col items-center w-20 ${
              tempFilter === filter.name
                ? "text-blue-600 font-bold"
                : "text-gray-600"
            }`}
          >
            <div className="w-20 h-12 rounded-md overflow-hidden mb-1 border">
              <img
                src={imageSrc}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.css }}
              />
            </div>
            <span className="text-xs">{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full justify-center">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filter
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
