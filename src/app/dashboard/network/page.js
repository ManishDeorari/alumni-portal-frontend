"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  getPendingRequests,
} from "@/api/connect";

const NetworkPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requested, setRequested] = useState({});
  const [accepted, setAccepted] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      // Get current user
      const meRes = await fetch(
        "https://alumni-backend-d9k9.onrender.com/api/user/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const meData = await meRes.json();
      setCurrentUser(meData);

      // Get pending requests
      const pending = await getPendingRequests();
      setPendingRequests(pending || []);

      // Get suggestions
      const suggRes = await fetch(
        "https://alumni-backend-d9k9.onrender.com/api/connect/suggestions",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const suggData = await suggRes.json();
      setSuggestions(suggData || []);
    };
    fetchData();
  }, []);

  const handleConnect = async (toUserId) => {
    await sendConnectionRequest(toUserId);
    setRequested((prev) => ({ ...prev, [toUserId]: true }));
  };

  const handleAccept = async (fromUserId) => {
    await acceptConnectionRequest(fromUserId);
    setAccepted((prev) => ({ ...prev, [fromUserId]: true }));
  };

  const handleSearch = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://alumni-backend-d9k9.onrender.com/api/connect/search?query=${searchQuery}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setAlumni(data || []);
  };

  const cancelRequest = async (toUserId) => {
  const res = await fetch(`${BASE_URL}/api/connect/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ toUserId }),
  });
  return await res.json();
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-center">My Network</h1>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search alumni by name, email, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded text-black"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((user) => (
                <div key={user._id} className="bg-yellow-50 text-gray-800 rounded p-4 shadow space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profileImage || "/default-profile.png"}
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
          </section>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">People You May Know</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((user) => (
                <div key={user._id} className="bg-white rounded-lg p-4 text-gray-800 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePicture || "/default-profile.png"} className="w-12 h-12 rounded-full" />
                    <div>
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <h3 className="font-semibold text-blue-700 hover:underline">{user.name}</h3>
                      </Link>
                      <p className="text-sm">{user.course || "Course not set"}</p>
                    </div>
                  </div>
                  <p className="text-sm">Enrollment: {user.enrollmentNumber}</p>
                  <button
                    onClick={() => handleConnect(user._id)}
                    disabled={requested[user._id]}
                    className={`px-4 py-2 rounded mt-2 ${
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
          </section>
        )}

        {/* Search Results */}
        {alumni.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alumni.map((user) => (
                <div key={user._id} className={`rounded-lg p-4 shadow space-y-2 ${user.isConnected ? "bg-gray-200 text-gray-800" : "bg-white text-gray-800"}`}>
                  <div className="flex items-center gap-3">
                    <img src={user.profilePicture || "/default-profile.png"} className="w-12 h-12 rounded-full" />
                    <div>
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <h3 className="font-semibold text-blue-700 hover:underline">{user.name}</h3>
                      </Link>
                      <p className="text-sm">{user.course || "Course not set"}</p>
                    </div>
                  </div>
                  <p className="text-sm">Enrollment: {user.enrollmentNumber}</p>
                  {!user.isConnected && (
                    <button
                      onClick={() => handleConnect(user._id)}
                      disabled={requested[user._id]}
                      className={`px-4 py-2 rounded mt-2 ${
                        requested[user._id]
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {requested[user._id] ? "Requested" : "Connect"}
                    </button>
                  )}
                  {user.isConnected && <p className="text-green-600 font-semibold">Already Connected</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default NetworkPage;
