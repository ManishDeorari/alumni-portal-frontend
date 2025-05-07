"use client";
import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/user/award-eligible", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <div className="bg-white text-black p-6 rounded-2xl shadow-md w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🏆 Top Alumni - Award Leaderboard
      </h1>
      {users.length === 0 ? (
        <p className="text-center text-gray-500">No eligible users yet.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user, index) => (
            <li
              key={user._id}
              className="flex items-center justify-between bg-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-gray-700 w-6">
                  {index + 1}.
                </span>
                <img
                  src={user.profilePicture || "/default-profile.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <p className="font-semibold text-lg text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.enrollmentNumber}</p>
                </div>
              </div>
              <span className="font-bold text-blue-600 text-lg">
                {user.points?.total || 0} pts
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
