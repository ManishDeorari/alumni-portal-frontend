"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar"; // ✅ Sidebar imported
import Link from "next/link";

export default function MessagesPage() {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState({}); // key: userId, value: array of messages

  useEffect(() => {
    const fetchConnected = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/connected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConnectedUsers(data);
        if (data.length) {
          setSelectedUser(data[0]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch connections:", err.message);
      }
    };

    fetchConnected();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const updated = { ...chats };
    const userId = selectedUser._id;
    if (!updated[userId]) updated[userId] = [];
    updated[userId].push({ text: "You: " + newMessage });
    setChats(updated);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6">
      <Sidebar /> {/* ✅ Sidebar added */}
      <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Messages</h1>

      <div className="flex gap-6">
        <div className="w-1/3 bg-white text-black rounded-lg shadow p-4 space-y-2 h-[70vh] overflow-y-auto">
          {connectedUsers.map((user) => (
            <div
              key={user._id}
              className={`p-2 flex gap-3 items-center rounded cursor-pointer hover:bg-blue-100 ${
                selectedUser?._id === user._id ? "bg-blue-200" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img
                src={user.profilePic || "/default-user.jpg"}
                className="w-10 h-10 rounded-full object-cover"
                alt={user.name}
              />
              <Link href={`/dashboard/profile/${user._id}`} className="hover:underline font-semibold text-blue-700">
                {user.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="w-2/3 bg-white text-black rounded-lg shadow p-4 flex flex-col h-[70vh]">
          <div className="flex-grow space-y-2 overflow-auto mb-4">
            {(chats[selectedUser?._id] || []).map((msg, i) => (
              <p key={i}>{msg.text}</p>
            ))}
          </div>
          <div className="flex">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 rounded-l border"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-r">
              Send
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
