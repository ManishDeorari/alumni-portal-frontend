const BASE = "https://alumni-backend-d9k9.onrender.com";

export const getProfileById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/api/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return await res.json();
};
