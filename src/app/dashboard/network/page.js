"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NetworkPage() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/all", {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
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
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePic || "/default-user.jpg"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link href={`/dashboard/profile/${user._id}`}>
                      <h2 className="text-lg font-semibold text-blue-600 hover:underline">{user.name}</h2>
                    </Link>
                    <p className="text-sm text-gray-500">{user.course || "Course not set"}</p>
                  </div>
                </div>
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
