const BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

// ================== FETCH POSTS ==================
export const fetchPosts = async () => {
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

// ================== CREATE POST ==================
export const createPost = async (content, image, video) => {
  let imageUrls = [];
  let videoUrl = "";

  // Upload multiple images to Cloudinary
  if (image && image.length > 0) {
    for (let img of image) {
      const imageData = new FormData();
      imageData.append("file", img);
      imageData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
        method: "POST",
        body: imageData,
      });

      const uploadJson = await uploadRes.json();
      if (uploadJson.secure_url) {
        imageUrls.push(uploadJson.secure_url);
      } else {
        console.warn("Image upload failed:", uploadJson);
      }
    }
  }

  // Upload video to Cloudinary if provided
  if (video) {
    const videoData = new FormData();
    videoData.append("file", video);
    videoData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, {
      method: "POST",
      body: videoData,
    });

    const uploadJson = await uploadRes.json();
    if (uploadJson.secure_url) {
      videoUrl = uploadJson.secure_url;
    } else {
      console.warn("Video upload failed:", uploadJson);
    }
  }

  // Submit the post with media URLs
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      content,
      images: imageUrls,
      video: videoUrl,
    }),
  });

  const data = await res.json();
  await updatePoints(5);
  return data;
};

// ================== COMMENT ON POST ==================
export const commentOnPost = async (postId, text) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ comment: text }), // ✅ fixed here
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Comment failed:", errText);
      throw new Error("Comment API failed");
    }

    const data = await res.json();
    await updatePoints(3);
    return data;
  } catch (error) {
    console.error("commentOnPost() error:", error.message);
    throw error;
  }
};

// ================== LIKE POST ==================
export const likePost = async (postId) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Like failed:", errText);
      throw new Error("Like API failed");
    }

    const data = await res.json();
    await updatePoints(2);
    return data;
  } catch (error) {
    console.error("likePost() error:", error.message);
    throw error;
  }
};

// ================== REACT TO POST ==================
export const reactToPost = async (postId, emoji) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/react`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ emoji }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Reaction failed:", errText);
      throw new Error("React API failed");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("reactToPost() error:", error.message);
    throw error;
  }
};

// ================== UPDATE POINTS ==================
export const updatePoints = async (amount) => {
  await fetch(`${BASE}/user/points/add`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ amount }),
  });
};

// ================== EDIT COMMENT ==================
export const editComment = async (postId, commentId, newText) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/comment/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ comment: newText }),
    });

    if (!res.ok) throw new Error("Edit comment failed");
    return await res.json();
  } catch (error) {
    console.error("editComment() error:", error.message);
    throw error;
  }
};
