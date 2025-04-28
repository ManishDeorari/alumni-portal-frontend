// frontend/src/api/dashboard.js

const BASE_URL = "https://alumni-backend-d9k9.onrender.com/api"; // 🔥 Live backend

export const fetchUser = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to fetch user:", res.status, text);
    throw new Error("User fetch failed");
  }

  return await res.json();
};

export const fetchPosts = async () => {
  const res = await fetch(`${BASE_URL}/posts`);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to fetch posts:", res.status, text);
    throw new Error("Posts fetch failed");
  }

  return await res.json();
};

export const createPost = async (content) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to create post:", res.status, text);
    throw new Error("Create post failed");
  }

  return await res.json();
};

export const fetchEvents = async () => {
  const res = await fetch(`${BASE_URL}/events`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to fetch events:", res.status, text);
    throw new Error("Events fetch failed");
  }

  return await res.json();
};
