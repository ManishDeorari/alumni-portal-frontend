"use client";
import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const togglePicker = (e) => {
    e.stopPropagation();
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
            style={{
              top: "-180px",        // move picker upward
              left: "-100px",       // shift picker to the left
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiPickerToggle;
