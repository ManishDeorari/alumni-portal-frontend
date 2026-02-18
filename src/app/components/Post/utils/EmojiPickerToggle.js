import React, { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const DEFAULT_OFFSET = { x: 0, y: 0 };

const EmojiPickerToggle = ({
  onEmojiSelect,
  iconSize = "text-xl",
  icon = "😀",
  offset = DEFAULT_OFFSET,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStyle, setPickerStyle] = useState({ top: "0px", left: "0px" });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          const pickerWidth = 500;
          const pickerHeight = 600;

          const spaceRight = windowWidth - rect.left;
          const spaceBottom = windowHeight - rect.bottom;
          const spaceTop = rect.top;

          const tooCloseToRight = spaceRight < pickerWidth;
          const tooCloseToBottom = spaceBottom < pickerHeight;
          const tooCloseToTop = spaceTop < pickerHeight;

          // Calculate absolute fixed position based on viewport
          const style = {
            position: "fixed",
            zIndex: 9999,
          };

          if (tooCloseToTop) {
            style.top = `${rect.bottom + 8 + offset.y}px`;
          } else if (tooCloseToBottom) {
            style.bottom = `${windowHeight - rect.top + 8 + offset.y}px`;
          } else {
            // Default to showing below unless no space
            style.top = `${rect.bottom + 8 + offset.y}px`;
          }

          if (tooCloseToRight) {
            style.right = `${windowWidth - rect.right + offset.x}px`;
          } else {
            style.left = `${rect.left + offset.x}px`;
          }

          setPickerStyle(style);
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, offset]);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        className={`relative ${iconSize} hover:scale-110 transition-transform`}
        onClick={togglePicker}
      >
        {icon}
      </button>

      {mounted && showPicker && createPortal(
        <AnimatePresence>
          <motion.div
            ref={pickerRef}
            className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-black ring-opacity-5"
            style={pickerStyle}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji) => {
                onEmojiSelect(emoji);
                // setShowPicker(false); // Keep open until click outside
              }}
              theme="dark"
              perLine={8}
              emojiSize={24}
              emojiButtonSize={36}
            />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default EmojiPickerToggle;
