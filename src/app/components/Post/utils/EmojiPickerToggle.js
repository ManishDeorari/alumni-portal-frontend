"use client";
import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
  offset = { x: 0, y: 0 }, // 🔥 Use this for minor manual shifts
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStyle, setPickerStyle] = useState({ top: "40px", left: "0px" });

  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  const togglePicker = (e) => {
    e.stopPropagation();
    setShowPicker((prev) => !prev);
  };

  const handleClickOutside = (e) => {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);

      setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          const pickerWidth = 300;
          const pickerHeight = 350;

          const spaceRight = windowWidth - rect.left;
          const spaceBottom = windowHeight - rect.bottom;

          const tooCloseToRight = spaceRight < pickerWidth;
          const tooCloseToBottom = spaceBottom < pickerHeight;

          setPickerStyle({
            top: tooCloseToBottom ? undefined : `${40 + offset.y}px`,
            bottom: tooCloseToBottom ? `${40 + offset.y}px` : undefined,
            left: tooCloseToRight ? undefined : `${offset.x}px`,
            right: tooCloseToRight ? `${offset.x}px` : undefined,
          });
        }
      }, 0);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, offset]);

  return (
    <button ref={buttonRef} type="button" className={`relative ${iconSize}`} onClick={togglePicker}>
      {icon}

      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            className="z-50 absolute"
            style={pickerStyle}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default EmojiPickerToggle;
