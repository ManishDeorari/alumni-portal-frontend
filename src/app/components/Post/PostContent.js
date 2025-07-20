"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPickerToggle from "../EmojiPickerToggle";

export default function PostContent({
  editing,
  editContent,
  setEditContent,
  handleEditSave,
  handleBlurSave,
  post,
  textareaRef,
  setShowModal
}) {
  const handleEmojiSelect = (emoji) => {
    setEditContent((prev) => prev + emoji.native);
  };

  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
          key="editor"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={() => handleBlurSave(editContent, `edit-${post._id}`)}
              rows={3}
              className="w-full border rounded p-2 resize-none"
              placeholder="Edit your post..."
            />
            <div className="absolute bottom-[120%] right-[120px] z-50">
              <EmojiPickerToggle
                onEmojiSelect={handleEmojiSelect}
                icon="😀"
                iconSize="text-2xl"
              />
            </div>
          </div>

          <div className="p-2 border border-gray-300 rounded bg-gray-50">
            <p className="text-sm text-gray-500 font-semibold">Preview:</p>
            <p className="whitespace-pre-wrap">{editContent}</p>
          </div>

          <button
            onClick={() => handleEditSave(editContent)}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="whitespace-pre-wrap">{post.content}</p>
          <div
            onClick={() => setShowModal(true)}
            className="cursor-pointer text-sm text-blue-600 underline mt-1"
          >
            View full post
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
