"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"; // ✅ Sidebar imported

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <Sidebar /> {/* ✅ Sidebar added */}
      
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((note, i) => (
              <li key={i} className="bg-white text-black rounded-lg shadow p-4">
                <p>{note.message}</p>
                <p className="text-xs text-gray-500">{new Date(note.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
