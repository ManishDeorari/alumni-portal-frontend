"use client";
import React, { useState, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function PostCard({ post, currentUser, setPosts }) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const commentInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const hasLiked = post.likes.includes(currentUser._id);

  const getReactionCount = (emoji) =>
    post.reactions?.[emoji]?.length || 0;

  const userReacted = (emoji) =>
    post.reactions?.[emoji]?.includes(currentUser._id);

  const checkAuth = () => {
    if (!token) {
      alert("Please log in to interact with posts.");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkAuth()) return;
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

  const handleComment = async () => {
    if (!checkAuth()) return;
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

  const handleReact = async (emoji) => {
    if (!checkAuth()) return;
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}/react`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      }
    );
    const updated = await res.json();
    setShowReactionPicker(false);
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!checkAuth()) return;
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

  const toggleEdit = () => {
    setEditing(!editing);
    setEditContent(post.content);
  };

  const handleEditSave = async () => {
    if (!checkAuth()) return;
    if (!editContent.trim()) return alert("Content cannot be empty");
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/posts/${post._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editContent }),
      }
    );
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
    setEditing(false);
  };

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
          onClick={() =>
            document.getElementById(`comment-input-${post._id}`)?.focus()
          }
          className="font-semibold text-gray-600"
        >
          💬 Comment ({post.comments.length})
        </button>

        <div className="relative">
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className="text-purple-600 text-sm underline"
          >
            😊 React
          </button>
          {showReactionPicker && (
            <div className="absolute z-50">
              <Picker
                data={data}
                onEmojiSelect={(emoji) => handleReact(emoji.native)}
                theme="light"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-2 flex-wrap">
        {post.reactions &&
          Object.entries(post.reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`text-2xl px-2 py-1 rounded-full border ${
                userReacted(emoji)
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-100 border-gray-300"
              }`}
              title={`${users.length} reacted`}
            >
              {emoji} {users.length}
            </button>
          ))}
      </div>

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

      <div className="pt-2 border-t border-gray-200 flex gap-2 items-center relative">
        <input
          id={`comment-input-${post._id}`}
          type="text"
          ref={commentInputRef}
          placeholder="Write a comment..."
          className="flex-grow border rounded px-3 py-1"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
        <button
          onClick={() => setShowCommentEmojiPicker((prev) => !prev)}
          className="text-2xl"
          title="Add emoji"
        >
          😊
        </button>
        {showCommentEmojiPicker && (
          <div className="absolute bottom-12 right-0 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emoji) => {
                setComment((prev) => prev + emoji.native);
                setShowCommentEmojiPicker(false);
                setTimeout(() => commentInputRef.current?.focus(), 0);
              }}
              theme="light"
            />
          </div>
        )}
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
