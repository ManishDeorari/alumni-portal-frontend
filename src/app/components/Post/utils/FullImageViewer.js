import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FullImageViewer({ images, startIndex, onClose, isRestricted }) {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  React.useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  return (
    <AnimatePresence>
      {images?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
        >
          {/* Exit button - moved outside container to match ImageViewerModal */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 z-[10000]"
          >
            <X className="text-white" size={28} />
          </button>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-[90vw] h-[90vh] flex items-center justify-center rounded-lg overflow-hidden shadow-lg"
          >
            {/* Left/Right Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 text-white text-3xl bg-black bg-opacity-40 px-3 py-1 rounded-full z-30"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 text-white text-3xl bg-black bg-opacity-40 px-3 py-1 rounded-full z-30"
                >
                  ›
                </button>
              </>
            )}

            {/* Image Display */}
            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex]}
                alt={`image-${currentIndex}`}
                fill
                className={`object-contain ${isRestricted ? 'select-none' : ''}`}
                onContextMenu={(e) => isRestricted && e.preventDefault()}
                onDragStart={(e) => isRestricted && e.preventDefault()}
              />

              {/* Protective Overlay */}
              {isRestricted && (
                <div
                  className="absolute inset-0 z-20"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </div>

            {/* 🔥 Invisible Left/Right Tap Zones - Moved behind arrows but in front of image/overlay */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer z-20"
              onClick={prev}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer z-20"
              onClick={next}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
