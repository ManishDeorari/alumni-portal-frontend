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
