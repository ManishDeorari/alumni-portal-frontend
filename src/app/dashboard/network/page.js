"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"; // ✅ Add this

export default function NetworkPage() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setAlumni(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Error fetching alumni:", error.message);
      }
    };

    fetchAlumni();
  }, []);

  const filtered = alumni.filter(
    (a) =>
      (a.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (a.enrollmentNumber || "").includes(search)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar /> {/* ✅ Sidebar added at top */}
      
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">My Network</h1>

        <input
          type="text"
          placeholder="Search alumni by name or enrollment number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded bg-white text-gray-800 border shadow focus:outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <div key={user._id} className="bg-white text-gray-800 rounded p-4 shadow space-y-2">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm">Enrollment: {user.enrollmentNumber}</p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Connect
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-2">No alumni found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
