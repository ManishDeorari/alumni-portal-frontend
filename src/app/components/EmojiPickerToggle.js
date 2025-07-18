"use client";
import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
  cursorPositioned = true,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const pickerRef = useRef(null);

  const togglePicker = (e) => {
    e.stopPropagation();
    if (cursorPositioned) {
      setCoords({ x: e.clientX, y: e.clientY });
    }
    setShowPicker((prev) => !prev);
  };

  const handleClickOutside = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="relative inline-block">
      <button type="button" className={iconSize} onClick={togglePicker}>
        {icon}
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            className="z-50 absolute"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={
              cursorPositioned
                ? {
                    top: coords.y + 10,
                    left: coords.x,
                    position: "fixed",
                  }
                : {}
            }
          >
            <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiPickerToggle;
