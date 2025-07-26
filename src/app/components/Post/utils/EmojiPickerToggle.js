"use client";
import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";

// 🔧 Position utility that supports keywords and raw props
const computePositionStyle = ({ position, top, bottom, left, right }) => {
  // Priority: Numeric props > Keyword position
  if (top !== undefined || bottom !== undefined || left !== undefined || right !== undefined) {
    const style = {};
    if (top !== undefined) style.top = typeof top === "number" ? `${top}px` : top;
    if (bottom !== undefined) style.bottom = typeof bottom === "number" ? `${bottom}px` : bottom;
    if (left !== undefined) style.left = typeof left === "number" ? `${left}px` : left;
    if (right !== undefined) style.right = typeof right === "number" ? `${right}px` : right;
    return style;
  }

  // Fallback: keyword-based
  switch (position) {
    case "top-left":
      return { bottom: "40px", left: "0" };
    case "top-right":
      return { bottom: "40px", right: "0" };
    case "bottom-left":
      return { top: "40px", left: "0" };
    case "bottom-right":
    default:
      return { top: "40px", right: "0" };
  }
};

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
  position = "bottom-right", // string like "top-left"
  top,
  bottom,
  left,
  right,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const positionStyle = computePositionStyle({ position, top, bottom, left, right });

  return (
    <button ref={buttonRef} type="button" className={`relative ${iconSize}`} onClick={togglePicker}>
      {icon}

      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            className="z-50 absolute"
            style={positionStyle}
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
