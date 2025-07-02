"use client";
import React, { useState } from "react";
import axios from "axios";

const emojis = ["❤️", "😂", "😮", "😢", "😡"];

const PostCard = ({ post, currentUser, onUpdate, onDelete }) => {
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    const res = await axios.patch(`/api/posts/${post._id}/like`);
    onUpdate(res.data);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const res = await axios.post(`/api/posts/${post._id}/comment`, {
      text: commentText,
    });
    setCommentText("");
    onUpdate(res.data);
  };

  const handleReaction = async (emoji) => {
    const res = await axios.patch(`/api/posts/${post._id}/react`, { emoji });
    onUpdate(res.data);
  };

  const handleEdit = async () => {
    const newContent = prompt("Edit your post:", post.content);
    if (newContent === null) return;
    const res = await axios.patch(`/api/posts/${post._id}`, { content: newContent });
    onUpdate(res.data);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/posts/${post._id}`);
    onDelete(post._id);
  };

  const liked = post.likes.includes(currentUser._id);

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <div className="flex items-center space-x-2">
        <img
          src={post.user.profilePic || "/default-avatar.png"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold">{post.user.name}</span>
      </div>

      <p className="mt-2 text-gray-800 whitespace-pre-line">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="mt-2 max-h-96 object-contain rounded-xl"
        />
      )}

      <div className="flex items-center space-x-4 mt-3 text-sm">
        <button onClick={handleLike} className="text-blue-600">
          {liked ? "💙 Liked" : "👍 Like"} ({post.likes.length})
        </button>

        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="hover:scale-110 transition text-lg"
          >
            {emoji} {post.reactions?.[emoji]?.length || 0}
          </button>
        ))}

        <button className="text-gray-600">💬 {post.comments.length} Comments</button>

        {post.user._id === currentUser._id && (
          <>
            <button onClick={handleEdit} className="text-yellow-600">✏️ Edit</button>
            <button onClick={handleDelete} className="text-red-600">🗑️ Delete</button>
          </>
        )}
      </div>

      {/* Comment input */}
      <div className="flex items-center mt-3 space-x-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 border p-1 rounded"
        />
        <button onClick={handleComment} className="bg-blue-500 text-white px-3 py-1 rounded">
          Send
        </button>
      </div>

      {/* Comment list */}
      <div className="mt-3 space-y-2">
        {post.comments.map((c, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            <img
              src={c.user.profilePic || "/default-avatar.png"}
              className="w-8 h-8 rounded-full"
              alt=""
            />
            <div>
              <span className="font-medium">{c.user.name}</span>
              <p className="text-sm">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
