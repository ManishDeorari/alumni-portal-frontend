"use client";
import React, { useState } from "react";

export default function PostCard({ post, currentUser, setPosts }) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const token = localStorage.getItem("token");

  const hasLiked = post.likes.includes(currentUser._id);

  // Handle Like
  const handleLike = async () => {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/like`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  // Handle Comment
  const handleComment = async () => {
    if (!comment.trim()) return;
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: comment }),
      }
    );
    const updated = await res.json();
    setComment("");
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  // Handle React with emoji
  const handleReact = async (emoji) => {
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/react`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  // Handle Delete Post
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setPosts((prev) => prev.filter((p) => p._id !== post._id));
  };

  // Handle Edit Toggle
  const toggleEdit = () => {
    setEditing(!editing);
    setEditContent(post.content);
  };

  // Handle Edit Save
  const handleEditSave = async () => {
    if (!editContent.trim()) return alert("Content cannot be empty");
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    setEditing(false);
  };

  // Get reaction count helper
  const getReactionCount = (emoji) =>
    post.reactions?.[emoji]?.length || 0;

  // Check if user reacted with emoji
  const userReacted = (emoji) =>
    post.reactions?.[emoji]?.includes(currentUser._id);

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={post.user?.profilePic || "/default-profile.png"}
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{post.user?.name || "Unknown"}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        {post.user?._id === currentUser._id && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={toggleEdit}
              className="text-blue-600 hover:underline text-sm"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full border rounded p-2"
        />
      ) : (
        <p>{post.content}</p>
      )}

      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded max-h-96 w-full object-contain"
        />
      )}

      {editing && (
        <button
          onClick={handleEditSave}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Save
        </button>
      )}

      <div className="flex items-center gap-5 pt-2 border-t border-gray-300">
        <button
          onClick={handleLike}
          className={`font-semibold ${
            hasLiked ? "text-blue-600" : "text-gray-600"
          }`}
        >
          👍 Like ({post.likes.length})
        </button>

        <button
          onClick={() => document.getElementById(`comment-input-${post._id}`)?.focus()}
          className="font-semibold text-gray-600"
        >
          💬 Comment ({post.comments.length})
        </button>
      </div>

      {/* Reaction emojis */}
      <div className="flex gap-3 mt-2">
        {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`text-2xl ${
              userReacted(emoji) ? "scale-110" : ""
            } transition-transform`}
            title={`${getReactionCount(emoji)} reacted`}
          >
            {emoji} {getReactionCount(emoji) > 0 ? getReactionCount(emoji) : ""}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="space-y-2 pt-3 border-t border-gray-200 max-h-56 overflow-y-auto">
        {post.comments.map((c) => (
          <div key={c._id} className="flex items-start gap-2">
            <img
              src={c.user?.profilePic || "/default-profile.png"}
              alt="commenter"
              className="w-8 h-8 rounded-full mt-1"
            />
            <div>
              <p className="text-sm font-semibold">{c.user?.name}</p>
              <p>{c.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="pt-2 border-t border-gray-200 flex gap-2 items-center">
        <input
          id={`comment-input-${post._id}`}
          type="text"
          placeholder="Write a comment..."
          className="flex-grow border rounded px-3 py-1"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
