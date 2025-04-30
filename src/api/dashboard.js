const BASE = "https://alumni-backend-d9k9.onrender.com/api";

export const fetchPosts = async () => {
  const res = await fetch(`${BASE}/posts`);
  return res.json();
};

export const createPost = async (content) => {
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ content }),
  });
  return res.json();
};

export const likePost = async (postId) => {
  const res = await fetch(`${BASE}/posts/${postId}/like`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.json();
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
  return res.json();
};
