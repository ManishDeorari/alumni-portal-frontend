"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import ChatSidebar from "../../components/messages/ChatSidebar";
import ChatWindow from "../../components/messages/ChatWindow";
import socket from "@/utils/socket";

export default function MessagesPage() {
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

        // Fetch connections
        // Note: Checking if /api/user/connected exists or using fallback logic
        let res = await fetch(`${API_URL}/api/user/connected`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fallback: if /connected route doesn't exist, try getting all connections manually 
        // (Assuming typical setup: check network/connections)
        // For now relying on the route existing as per plan, if 404 we will debug.

        if (res.ok) {
          const data = await res.json();
          setConnectedUsers(data);
          setFilteredConnections(data);
          if (data.length > 0) {
            // Optionally auto-select first user, but maybe better to let user choose
            // setSelectedUser(data[0]); 
          }
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
      // Defensive check for msg and msg.sender
      if (!msg || !msg.sender) return;

      // Only append if the message belongs to the currently open chat
      const senderId = msg.sender._id || msg.sender;
      if (selectedUser && (senderId === selectedUser._id || msg.recipient === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);

        // If message is from the selected user, mark it as read immediately
        if (senderId === selectedUser._id) {
          markAsRead(selectedUser._id);
        }
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      // If the other person read my messages, update local state to show blue ticks
      if (selectedUser && readerId === selectedUser._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.recipient === readerId || m.recipient._id === readerId
              ? { ...m, read: true }
              : m
          )
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [selectedUser]);

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

    // Optimistic update
    const tempMsg = {
      _id: Date.now(), // temp id
      sender: currentUser,
      recipient: selectedUser._id,
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage(""); // Clear input immediately

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

      if (res.ok) {
        const savedMsg = await res.json();
        // Replace temp message with real one (or just assume success since we optimistic updated)
        // Ideally we map and replace ID, but appending works for now if we don't duplicate.
        // Since we optimistic updated, we might get a duplicate if socket also fires back 'receiveMessage' for self.
        // Usually 'receiveMessage' is broadcast to others, not sender. 
        // If socket emits to sender too, we need to handle dedup. 
        // My backend code: req.io.to(recipientId).emit... -> It sends to RECIPIENT, not sender. So optimistic update is fine.
      } else {
        console.error("Failed to send message");
        // Revert optimistic update ideally
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 5. Search Logic
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
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
