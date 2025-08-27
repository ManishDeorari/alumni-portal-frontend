import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { RotateCw, RotateCcw } from "lucide-react";
import getCroppedImg from "../Avatar/cropImageUtils";

export default function BannerImageCropper({ imageSrc, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Store original image for reset
  const originalImageRef = useRef(null);

  useEffect(() => {
    if (imageSrc && !originalImageRef.current) {
      originalImageRef.current = imageSrc;
    }
  }, [imageSrc]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (onComplete && originalImageRef.current) {
      onComplete(originalImageRef.current);
    }
  };

  const handleFixPosition = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (onComplete) {
        onComplete(croppedImage);
      }
    } catch (e) {
      console.error("Fix position error:", e);
    }
  };

  return (
    <div
      className="relative w-full max-w-3xl mx-auto p-2 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      {/* Cropper area */}
      <div className="relative w-full h-[300px] bg-black/70 rounded-lg overflow-hidden flex items-center justify-center">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={16 / 5}      // ✅ rectangle for banner
          cropShape="rect"     // ✅ rectangle instead of circle
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom Slider */}
      <div className="w-full mt-4 flex flex-col items-center">
        <label className="text-lg font-semibold text-gray-700 mb-1">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg cursor-pointer accent-blue-600"
        />
      </div>

      {/* Buttons row */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setRotation((r) => r - 90)}
          className="bg-gray-200 p-3 rounded-full hover:bg-gray-300"
          title="Rotate Left"
        >
          <RotateCcw size={22} />
        </button>
        <button
          onClick={() => setRotation((r) => r + 90)}
          className="bg-gray-200 p-3 rounded-full hover:bg-gray-300"
          title="Rotate Right"
        >
          <RotateCw size={22} />
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-200 p-3 rounded-full hover:bg-gray-300"
          title="Reset to Original"
        >
          <RotateCcw size={22} className="text-red-500" />
        </button>
      </div>

      {/* Fix Position */}
      <button
        onClick={handleFixPosition}
        className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 w-full hover:bg-blue-700"
        title="Apply current crop and save"
      >
        Fix Position
      </button>
    </div>
  );
}
