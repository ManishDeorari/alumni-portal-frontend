const BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

export const fetchPosts = async () => {
  console.log("Posting to:", `${BASE}/posts`);
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const createPost = async (content, image, video) => {
  let imageUrl = "";
  let videoUrl = "";

  // ✅ Upload image to Cloudinary if provided
if (image) {
  const imageData = new FormData();
  imageData.append("file", image);
  imageData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const uploadRes = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, {
    method: "POST",
    body: imageData,
  });

  const uploadJson = await uploadRes.json();
  if (uploadJson.secure_url) {
    imageUrl = uploadJson.secure_url;
  } else {
    console.warn("Image upload failed:", uploadJson);
  }
}

// ✅ Upload video to Cloudinary if provided
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

  // ✅ Submit the post with uploaded media URLs
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      content,
      image: imageUrl,
      video: videoUrl,
    }),
  });

  const data = await res.json();

  // ✅ Award points for post creation (+5)
  await updatePoints(5);
  return data;
};

export const likePost = async (postId) => {
  const res = await fetch(`${BASE}/posts/${postId}/like`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();

  // ✅ Award points for liking a post (+2)
  await updatePoints(2);
  return data;
};

export const commentOnPost = async (postId, text) => {
  const res = await fetch(`${BASE}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();

  // ✅ Award points for commenting on a post (+3)
  await updatePoints(3);
  return data;
};

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
