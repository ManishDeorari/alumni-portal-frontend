"use client";
import React from "react";
import ImageGallery from "./ImageGallery"; // adjust the path if needed
import FullImageViewer from "./FullImageViewer"; // optional, handled separately

export default function PostMedia({ post, setSelectedImage }) {
  if (!(post.images?.length > 0 || post.video || post.image)) return null;

  return (
    <div className="mt-2">
      {/* Multiple Images */}
      {post.images?.length > 0 && (
        <ImageGallery
          images={post.images}
          onImageClick={setSelectedImage}
        />
      )}

      {/* Single fallback image (older posts) */}
      {!post.images?.length && post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded-lg max-h-96 w-full object-contain border"
        />
      )}

      {/* Video */}
      {post.video && (
        <video
          controls
          className="rounded-lg w-full max-h-96 border mt-2"
        >
          <source src={post.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
