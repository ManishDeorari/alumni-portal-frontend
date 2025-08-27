import React, { useState } from "react";

export default function BannerImageAdjust({ imageUrl, onApply, onReset }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [invert, setInvert] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [darken, setDarken] = useState(0);

  const [activeAdjust, setActiveAdjust] = useState("Brightness");

  let tempFilter = "";
  if (temperature > 0) {
    tempFilter = `sepia(${temperature}%) hue-rotate(-10deg) saturate(110%)`;
  } else if (temperature < 0) {
    tempFilter = `sepia(${-temperature}%) hue-rotate(180deg) saturate(80%)`;
  }

  const filterStyle = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturation}%)
    blur(${blur}px)
    hue-rotate(${hue}deg)
    invert(${invert}%)
    grayscale(${grayscale}%)
    ${tempFilter}
  `;

  const handleApply = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    if (/^https?:\/\//i.test(imageUrl)) img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      if (darken > 0) {
        ctx.fillStyle = `rgba(0,0,0,${darken / 100})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "banner_adjusted.jpg", { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        onApply(url, file);
      }, "image/jpeg", 0.92);
    };
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setHue(0);
    setInvert(0);
    setTemperature(0);
    setGrayscale(0);
    setSharpen(0);
    setDarken(0);
    onReset?.();
  };

  const adjustments = [
    { name: "Brightness", value: brightness, min: 50, max: 150, setter: setBrightness, suffix: "%" },
    { name: "Contrast", value: contrast, min: 50, max: 200, setter: setContrast, suffix: "%" },
    { name: "Saturation", value: saturation, min: 0, max: 200, setter: setSaturation, suffix: "%" },
    { name: "Blur", value: blur, min: 0, max: 10, setter: setBlur, suffix: "px" },
    { name: "Hue Rotate", value: hue, min: 0, max: 360, setter: setHue, suffix: "°" },
    { name: "Invert", value: invert, min: 0, max: 100, setter: setInvert, suffix: "%" },
    { name: "Darken", value: darken, min: 0, max: 100, setter: setDarken, suffix: "%" },
    { name: "Temperature", value: temperature, min: -100, max: 100, setter: setTemperature, suffix: "" },
    { name: "Grayscale", value: grayscale, min: 0, max: 100, setter: setGrayscale, suffix: "%" },
    { name: "Sharpen", value: sharpen, min: 0, max: 100, setter: setSharpen, suffix: "%" },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Rectangle Preview */}
      <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border-2 border-gray-300 relative">
        <img
          src={imageUrl}
          alt="Adjust Preview"
          className="w-full h-full object-cover"
          style={{ filter: filterStyle }}
        />
        {darken > 0 && (
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ backgroundColor: `rgba(0,0,0,${darken / 100})` }}
          />
        )}
      </div>

      {/* Adjustment Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {adjustments.map((adj) => (
          <button
            key={adj.name}
            onClick={() => setActiveAdjust(adj.name)}
            className={`px-2 py-1 text-sm rounded-lg border ${
              activeAdjust === adj.name ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {adj.name}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="w-64">
        {adjustments
          .filter((adj) => adj.name === activeAdjust)
          .map((adj) => (
            <Slider
              key={adj.name}
              label={adj.name}
              value={adj.value}
              min={adj.min}
              max={adj.max}
              onChange={adj.setter}
              suffix={adj.suffix}
            />
          ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          ✅ Apply Adjustments
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "" }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">
        {label}: {value}{suffix}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
