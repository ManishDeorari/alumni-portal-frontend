// src/api/connect.js
const BASE_URL = "https://alumni-backend-d9k9.onrender.com";
const getToken = () => localStorage.getItem("token");

export async function sendConnectionRequest(toUserId) {
  const res = await fetch(`${BASE_URL}/api/connect/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ toUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function acceptConnectionRequest(fromUserId) {
  const res = await fetch(`${BASE_URL}/api/connect/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ fromUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Accept failed");
  return data;
}

export async function getPendingRequests() {
  const res = await fetch(`${BASE_URL}/api/connect/pending`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch pending failed");
  return data;
}
