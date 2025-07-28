import React, { useState } from "react";
import EmojiPickerToggle from "../utils/EmojiPickerToggle";

export default function ReplyBox({ parentId, onSubmit }) {
  const [replyText, setReplyText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      await onSubmit(text); // 🔄 Callback to parent
      setReplyText("");
      setShowEmoji(false);
    } catch (err) {
      console.error("Reply submit failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative flex gap-2 mt-2 items-start w-full">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-grow border rounded px-2 py-1 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <EmojiPickerToggle
        show={showEmoji}
        onEmojiSelect={(emoji) =>
          setReplyText((prev) => prev + emoji.native)
        }
        onToggle={() => setShowEmoji((prev) => !prev)}
        positionClass="absolute top-10 left-2"
      />
      <button
        onClick={handleSend}
        disabled={sending || !replyText.trim()}
        className="text-sm text-blue-600 font-semibold disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
