"use client";
import { useState } from "react";
import { likePost, commentOnPost } from "@/api/dashboard";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    const res = await likePost(post._id);
    setLikes(res.likes);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const updated = await commentOnPost(post._id, comment);
    setComments(updated);
    setComment("");
  };

  return (
    <div className="bg-white text-black rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center gap-2">
        {post.author?.profilePic && (
          <img
            src={post.author.profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
        )}
        <h3 className="font-semibold">{post.author?.name}</h3>
      </div>
      <p>{post.content}</p>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <button onClick={handleLike}>👍 {likes} Like</button>
        <span>💬 {comments.length} Comments</span>
      </div>

      {/* Comment Box */}
      <div className="flex gap-2 items-center mt-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow border rounded px-3 py-1 text-sm"
        />
        <button onClick={handleComment} className="text-sm text-blue-600 hover:underline">
          Post
        </button>
      </div>

      {/* Comments */}
      {comments.map((c, i) => (
        <p key={i} className="text-sm text-gray-700">
          • {c.text}
        </p>
      ))}
    </div>
  );
}
