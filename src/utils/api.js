// frontend/src/utils/api.js

export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Request failed");
  }

  return res.json();
};
