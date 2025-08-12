// frontend/components/ProfileImageCropper.js
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImageUtils"; // helper function

export default function ProfileImageCropper({ imageSrc, onComplete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onComplete(croppedImg);
    },
    [imageSrc, rotation, onComplete]
  );

  return (
    <div className="relative w-full h-[300px] bg-black">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={1} // square for profile pic
        onCropChange={setCrop}
        onRotationChange={setRotation}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        cropShape="round" // makes circle preview
        showGrid={false}
      />

      {/* Controls */}
      <div className="flex flex-col gap-2 mt-4">
        <label>Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />

        <label>Rotation</label>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
