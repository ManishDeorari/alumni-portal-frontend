const BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

// ================== FETCH POSTS ==================
export const fetchPosts = async (page = 1, limit = 10, type = "Regular") => {
  const res = await fetch(`${BASE}/posts?page=${page}&limit=${limit}&type=${type}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const createPost = async (content, image, video, type = "Regular") => {
  let imageObjects = [];
  let videoObject = null;

  if (!content.trim()) {
    return { message: "Failed to create post - No text or emoji." };
  }

  // ✅ Upload multiple images
  if (image && image.length > 0) {
    console.group("📤 Uploading Images to Cloudinary");
    for (let img of image) {
      const imageData = new FormData();
      imageData.append("file", img);
      imageData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      imageData.append("folder", "alumni/images"); // Optional folder for better management

      const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
        method: "POST",
        body: imageData,
      });

      const uploadJson = await uploadRes.json();
      if (uploadRes.ok && uploadJson.secure_url && uploadJson.public_id) {
        imageObjects.push({
          url: uploadJson.secure_url,
          public_id: uploadJson.public_id,
        });
        console.log("✅ Image uploaded:", uploadJson.secure_url);
        console.log("🆔 Cloudinary Asset ID:", uploadJson.asset_id);
        console.log("📦 Public ID:", uploadJson.public_id);
        console.log("📅 Created At:", uploadJson.created_at);
      } else {
        console.error("❌ Image upload failed:", uploadJson);
      }
    }
    console.groupEnd();
  }

  // ✅ Upload video
  if (video) {
    console.group("🎥 Uploading Video to Cloudinary");
    const videoData = new FormData();
    videoData.append("file", video);
    videoData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    videoData.append("folder", "alumni/videos");

    const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, {
      method: "POST",
      body: videoData,
    });

    const uploadJson = await uploadRes.json();
    if (uploadRes.ok && uploadJson.secure_url && uploadJson.public_id) {
      videoObject = {
        url: uploadJson.secure_url,
        public_id: uploadJson.public_id,
      };
      console.log("✅ Video uploaded:", uploadJson.secure_url);
      console.log("🎬 Resource Type:", uploadJson.resource_type);
      console.log("🆔 Asset ID:", uploadJson.asset_id);
      console.log("📦 Public ID:", uploadJson.public_id);
      console.log("📅 Created At:", uploadJson.created_at);
      console.log("📍 Version:", uploadJson.version_id);
      console.log("🎥 Video Upload Details:", uploadJson);
    } else {
      console.error("❌ Video upload failed:", uploadJson);
    }
    console.groupEnd();
  }

  // ✅ Send to backend
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      content,
      images: imageObjects,
      video: videoObject,
      type,
    }),
  });

  const data = await res.json();

  // ✅ Add content contribution points
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
      body: JSON.stringify({ text }), // ✅ fixed key
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
export const reactToPost = async (postId, emoji, action = "add") => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/react`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ emoji, action }), // ✅ fixed
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
      body: JSON.stringify({ text: newText }), // ✅ fixed key
    });

    if (!res.ok) throw new Error("Edit comment failed");
    return await res.json();
  } catch (error) {
    console.error("editComment() error:", error.message);
    throw error;
  }
};
