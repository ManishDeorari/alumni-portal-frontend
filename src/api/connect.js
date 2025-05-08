// src/api/connect.js
const BASE_URL = "https://alumni-backend-d9k9.onrender.com";
const getToken = () => localStorage.getItem("token");

export const sendConnectionRequest = async (toUserId) => {
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
};

export const acceptConnectionRequest = async (fromUserId) => {
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
};

export const getPendingRequests = async () => {
  const res = await fetch(`${BASE_URL}/api/connect/pending`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch pending failed");
  return data;
};

export const getMyConnections = async () => {
  const res = await fetch(`${BASE_URL}/api/connections/my`, {
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

export const removeConnection = async (targetId) => {
  const res = await fetch(`${BASE_URL}/api/connections/remove/${targetId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
};
