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

  const data = await res.json();

  // Award points for post creation (+5)
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

  // Award points for liking a post (+2)
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

  // Award points for commenting on a post (+3)
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
