"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import Image from "next/image";

export default function NetworkPage() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [myId, setMyId] = useState(null); // store current user ID

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlumni(data);
        }

        // Fetch current user
        const me = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await me.json();
        setMyId(meData._id);
      } catch (error) {
        console.error("❌ Error fetching data:", error.message);
      }
    };

    fetchAlumni();
  }, []);

  const handleConnect = async (targetId) => {
    const token = localStorage.getItem("token");
    await fetch("https://alumni-backend-d9k9.onrender.com/api/connect/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: targetId }),
    });
    alert("Connection request sent!");
  };

  const handleAccept = async (targetId) => {
    const token = localStorage.getItem("token");
    await fetch("https://alumni-backend-d9k9.onrender.com/api/connect/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requesterId: targetId }),
    });
    alert("Connection accepted!");
  };

  const filtered = alumni.filter(
    (a) =>
      (a.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (a.enrollmentNumber || "").includes(search)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 p-6 text-white">
      <Sidebar />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">🌐 My Network</h1>

        <input
          type="text"
          placeholder="Search alumni by name or enrollment number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded bg-white text-gray-800 border shadow focus:outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((user) => {
              if (user._id === myId) return null;

              return (
                <div key={user._id} className="bg-white text-gray-800 rounded p-4 shadow space-y-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.profilePic || "/default-profile.png"}
                      alt="avatar"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <h2 className="text-lg font-semibold text-blue-600 hover:underline">{user.name}</h2>
                      </Link>
                      <p className="text-sm text-gray-500">{user.course || "Course not set"}</p>
                    </div>
                  </div>
                  <p className="text-sm">Enrollment: {user.enrollmentNumber}</p>

                  {user.status === "pending" && user.requestedBy === myId ? (
                    <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
                      Request Sent
                    </button>
                  ) : user.status === "pending" && user.requestedBy !== myId ? (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleAccept(user._id)}
                    >
                      Accept
                    </button>
                  ) : user.status === "connected" ? (
                    <button className="px-4 py-2 bg-gray-500 text-white rounded" disabled>
                      Connected
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleConnect(user._id)}
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center col-span-2">No alumni found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
