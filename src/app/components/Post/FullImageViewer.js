// FullImageViewer.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FullImageViewer({ images, startIndex, onClose }) {
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
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-2xl z-10"
            >
              ✖
            </button>

            {/* Left/Right Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 text-white text-3xl bg-black bg-opacity-40 px-3 py-1 rounded-full"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 text-white text-3xl bg-black bg-opacity-40 px-3 py-1 rounded-full"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={images[currentIndex]}
              alt={`image-${currentIndex}`}
              className="rounded-lg max-h-[90vh] w-full object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
