"use client";

import React, { useEffect, useState } from "react";
import { getProfileById } from "../../../../api/profile";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  removeConnection,
  getConnectionStatus,
} from "../../../../api/connect";
import Image from "next/image";
import Sidebar from "../../../components/Sidebar"; // ✅ Sidebar as header

export default function ProfilePage({ params }) {
  const { id } = params;
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getProfileById(id);
      const connectionRes = await getConnectionStatus(id);
      setUser(res);
      setStatus(connectionRes.status);
    };
    fetchData();
  }, [id]);

  const handleConnect = async () => {
    await sendConnectionRequest(id);
    setStatus("pending");
  };

  const handleAccept = async () => {
    await acceptConnectionRequest(id);
    setStatus("connected");
  };

  const handleRemove = async () => {
    await removeConnection(id);
    setStatus(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white flex">
      <Sidebar /> {/* ✅ Sidebar included for navigation */}

      <div className="flex-grow p-6">
        {user && (
          <div className="bg-white text-black rounded-2xl shadow-xl p-6 w-full max-w-2xl space-y-6">
            <div className="flex items-center gap-6">
              <Image
                src={user.profileImage || "/default-profile.png"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full object-cover border border-gray-300"
              />
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.enrollmentNumber}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p><strong>Course:</strong> {user.course}</p>
              <p><strong>Graduation Year:</strong> {user.graduationYear}</p>
              <p><strong>Job Title:</strong> {user.jobTitle}</p>
              <p><strong>Time Period:</strong> {user.timePeriod}</p>
              <p><strong>Bio:</strong> {user.bio || "N/A"}</p>
            </div>

            <div className="pt-4">
              {status === "none" && (
                <button onClick={handleConnect} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Connect
                </button>
              )}
              {status === "pending" && (
                <p className="text-gray-600">⏳ Request sent</p>
              )}
              {status === "incoming" && (
                <button onClick={handleAccept} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  Accept Request
                </button>
              )}
              {status === "connected" && (
                <button onClick={handleRemove} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                  Remove Connection
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
