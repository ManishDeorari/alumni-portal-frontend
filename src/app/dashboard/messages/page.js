"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar"; // ✅ Sidebar imported

const dummyChats = [
  { user: "Alok", messages: ["Hey Manish!", "How are you doing?"] },
  { user: "Riya", messages: ["Hello!", "Congrats on the award!"] },
];

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState(dummyChats[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    selectedUser.messages.push("You: " + newMessage);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar /> {/* ✅ Sidebar added */}

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Messages</h1>

        <div className="flex gap-6">
          <div className="w-1/3 bg-white text-black rounded-lg shadow p-4 space-y-2">
            {dummyChats.map((chat, i) => (
              <div
                key={i}
                className={`p-2 rounded cursor-pointer hover:bg-blue-100 ${
                  selectedUser.user === chat.user ? "bg-blue-200" : ""
                }`}
                onClick={() => setSelectedUser(chat)}
              >
                {chat.user}
              </div>
            ))}
          </div>

          <div className="w-2/3 bg-white text-black rounded-lg shadow p-4 flex flex-col">
            <div className="flex-grow space-y-2 mb-4 overflow-auto">
              {selectedUser.messages.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
            <div className="flex">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 rounded-l border"
              />
              <button onClick={handleSend} className="btn rounded-l-none">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
