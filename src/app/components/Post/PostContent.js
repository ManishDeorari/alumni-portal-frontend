"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Picker from "@emoji-mart/react"; // assuming you use emoji-mart v3+
import data from "@emoji-mart/data";   // make sure this is installed
import { getEmojiFromUnified } from "../../../lib/emojiUtils"; // update path as needed

export default function PostContent({
  editing,
  editContent,
  setEditContent,
  handleEditSave,
  handleBlurSave,
  showEditEmoji,
  setShowEditEmoji,
  post,
  textareaRef,
  setShowModal
}) {
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
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlurSave}
            rows={3}
            className="w-full border rounded p-2"
            placeholder="Edit your post..."
          />
          <div className="relative">
            <button onClick={() => setShowEditEmoji(!showEditEmoji)} className="text-xl">
              😊
            </button>
            {showEditEmoji && (
              <div className="absolute right-0 z-50">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) =>
                    setEditContent(editContent + getEmojiFromUnified(emoji.unified))
                  }
                />
              </div>
            )}
          </div>
          <div className="p-2 border border-gray-300 rounded bg-gray-50">
            <p className="text-sm text-gray-500 font-semibold">Preview:</p>
            <p className="whitespace-pre-wrap">{editContent}</p>
          </div>
          <button
            onClick={handleEditSave}
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
