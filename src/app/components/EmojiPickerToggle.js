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
  const [pickerPosition, setPickerPosition] = useState({ top: "40px", left: "0px" });
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

      // Wait for next paint to measure
      setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const tooCloseToBottom = window.innerHeight - rect.bottom < 350;
          const tooCloseToRight = window.innerWidth - rect.left < 350;

          setPickerPosition({
            top: tooCloseToBottom ? "-320px" : "40px",
            left: tooCloseToRight ? "-250px" : "0px",
          });
        }
      }, 0);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="relative inline-block">
      <button ref={buttonRef} type="button" className={iconSize} onClick={togglePicker}>
        {icon}
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            className="z-50 absolute"
            style={pickerPosition}
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
