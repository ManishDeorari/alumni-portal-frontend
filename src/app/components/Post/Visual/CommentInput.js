import React, { useRef } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";
import socket from "../../../../utils/socket";

export default function CommentInput({
  comment,
  setComment,
  onSubmit,
  postId,
  currentUser,
}) {
  const inputRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + (emojiObject.native || emojiObject.emoji));
  };

  const handleTyping = (value) => {
  setComment(value);
  if (!currentUser || !currentUser._id) return;
  socket.emit("typing", {
    postId,
    user: currentUser._id,
  });
};

  return (
    <div className="relative mt-2">
      <div className="flex items-center gap-2 bg-white ">
        <input
          type="text"
          value={comment}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Write a comment..."
          className="flex-1 bg-white border border-black-300 rounded-full px-4 py-2 text-sm focus:outline-none"
          ref={inputRef}
        />

        <EmojiPickerToggle
          onEmojiSelect={handleEmojiClick}
          icon="😊"
          iconSize="text-xl"
        />

        <button
          onClick={onSubmit}
          className="ml-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-600"
        >
          Post
        </button>
      </div>
    </div>
  );
}
