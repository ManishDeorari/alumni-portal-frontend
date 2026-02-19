"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import ChatSidebar from "../../components/messages/ChatSidebar";
import ChatWindow from "../../components/messages/ChatWindow";
import socket from "@/utils/socket";
import { useTheme } from "@/context/ThemeContext";

export default function MessagesPage() {
  const { darkMode } = useTheme();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 1. Fetch current user and connections on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(user);

        // Join socket room for notifications and messages
        if (user?._id) {
          socket.emit("join", user._id);
        }

        // Fetch connections
        let res = await fetch(`${API_URL}/api/user/connected`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setConnectedUsers(data);
          setFilteredConnections(data);
        } else {
          console.error("Failed to fetch connections");
        }

      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchData();
  }, [API_URL]);

  // 2. Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    markAsRead(selectedUser._id);
    setNewMessage(""); // Clear input when switching chats
  }, [selectedUser, API_URL]);

  // 3. Socket.io listeners
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (!msg || !msg.sender) return;

      const senderId = msg.sender._id || msg.sender.id || msg.sender;
      const selectedId = selectedUser?._id || selectedUser?.id;
      const currentId = currentUser?._id || currentUser?.id;

      if (selectedId && (senderId === selectedId || msg.recipient === selectedId || msg.recipient === currentId)) {
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        if (senderId === selectedId) {
          markAsRead(selectedId);
        }
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      const selectedId = selectedUser?._id || selectedUser?.id;
      if (selectedId && readerId === selectedId) {
        setMessages((prev) =>
          prev.map((m) => {
            const recipientId = m.recipient?._id || m.recipient?.id || m.recipient;
            return recipientId === readerId ? { ...m, read: true } : m;
          })
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [selectedUser, currentUser]);

  const markAsRead = async (otherUserId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/messages/read/${otherUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // 4. Send Message Logic
  const handleSendMessage = async (text) => {
    if (!selectedUser || !text.trim()) return;

    const tempMsg = {
      _id: Date.now(),
      sender: currentUser,
      recipient: selectedUser._id,
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser._id,
          content: text,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setFilteredConnections(connectedUsers);
    } else {
      const filtered = connectedUsers.filter(u =>
        u.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredConnections(filtered);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const userObj = currentUser || JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
  }, [currentUser]);

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${darkMode ? "bg-gray-950 text-white" : "bg-white text-black"}`}>
      <SidebarComponent />

      <div className="p-6 max-w-7xl mx-auto flex gap-6 mt-6">
        <ChatSidebar
          connections={filteredConnections}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onSearch={handleSearch}
        />

        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
        />
      </div>
    </div>
  );
}
