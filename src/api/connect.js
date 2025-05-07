// src/api/connect.js
const BASE_URL = "https://alumni-backend-d9k9.onrender.com";

const getToken = () => localStorage.getItem("token");

export const sendConnectionRequest = async (targetId) => {
  const res = await fetch(`${BASE_URL}/api/connections/request/${targetId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};

export const acceptConnectionRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/api/connections/accept/${requestId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};

export const removeConnection = async (targetId) => {
  const res = await fetch(`${BASE_URL}/api/connections/remove/${targetId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};

export const getConnectionStatus = async (targetId) => {
  const res = await fetch(`${BASE_URL}/api/connections/status/${targetId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};

export const getMyConnections = async () => {
  const res = await fetch(`${BASE_URL}/api/connections/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};

// api/connect.js
export async function sendConnectionRequest(toUserId) {
  const token = localStorage.getItem("token");
  const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/connect/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ toUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// api/connect.js

export async function acceptConnectionRequest(fromUserId) {
  const token = localStorage.getItem("token");
  const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/connect/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fromUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Accept failed");
  return data;
}

export async function getPendingRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/connect/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch pending failed");
  return data;
}
