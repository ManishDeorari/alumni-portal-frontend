"use client";

import React, { useEffect, useState } from "react";
import { sendConnectionRequest, acceptConnectionRequest, getPendingRequests } from "@/api/connect";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NetworkPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [requested, setRequested] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [accepted, setAccepted] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const meRes = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        setCurrentUserId(meData._id);

        const allRes = await fetch("https://alumni-backend-d9k9.onrender.com/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allData = await allRes.json();
        setAlumni(Array.isArray(allData) ? allData : []);

        const pending = await getPendingRequests();
        setPendingRequests(Array.isArray(pending) ? pending : []);
      } catch (error) {
        console.error("❌ Error:", error.message);
      }
    };

    fetchData();
  }, []);

  const handleConnect = async (toUserId) => {
    try {
      await sendConnectionRequest(toUserId);
      setRequested((prev) => ({ ...prev, [toUserId]: true }));
    } catch (err) {
      alert("Error sending request: " + err.message);
    }
  };

  const handleAccept = async (fromUserId) => {
    try {
      await acceptConnectionRequest(fromUserId);
      setAccepted((prev) => ({ ...prev, [fromUserId]: true }));
    } catch (err) {
      alert("Error accepting request: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 p-6 text-white">
      <Sidebar />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">My Network</h1>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((user) => (
                <div key={user._id} className="bg-yellow-50 text-gray-800 rounded p-4 shadow space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/default-profile.png"}
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

                  <button
                    onClick={() => handleAccept(user._id)}
                    disabled={accepted[user._id]}
                    className={`mt-2 px-4 py-2 text-white rounded ${
                      accepted[user._id] ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {accepted[user._id] ? "Accepted" : "Accept"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          {alumni
            .filter((user) => user._id !== currentUserId)
            .map((user) => (
              <div key={user._id} className="bg-white rounded-lg p-6 shadow-md space-y-2 text-gray-800">
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePic || "/default-profile.png"}
                    alt="profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <Link href={`/dashboard/profile/${user._id}`}>
                      <h2 className="text-xl font-semibold text-blue-700 hover:underline">{user.name}</h2>
                    </Link>
                    <p className="text-sm text-gray-600">{user.course || "Course not set"}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">Enrollment: {user.enrollmentNumber}</p>
                <button
                  onClick={() => handleConnect(user._id)}
                  disabled={requested[user._id]}
                  className={`mt-3 px-4 py-2 rounded ${
                    requested[user._id]
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {requested[user._id] ? "Requested" : "Connect"}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
