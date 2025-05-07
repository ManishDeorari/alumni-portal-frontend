"use client";

import React, { useEffect, useState } from "react";
import { fetchUserById } from "../api/profile";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  removeConnection,
  getConnectionStatus,
} from "../api/connect";
import Image from "next/image";

export default function ProfilePage({ params }) {
  const { id } = params;
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchUserById(id);
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white flex flex-col items-center">
      {user && (
        <div className="bg-white text-black rounded-2xl shadow-xl p-6 w-full max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <Image
              src={user.profileImage || "/default-profile.png"}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.enrollmentNumber}</p>
            </div>
          </div>

          <p>{user.bio}</p>

          {status === "none" && (
            <button onClick={handleConnect} className="btn btn-primary">
              Connect
            </button>
          )}
          {status === "pending" && <p>⏳ Request sent</p>}
          {status === "incoming" && (
            <button onClick={handleAccept} className="btn btn-success">
              Accept Request
            </button>
          )}
          {status === "connected" && (
            <button onClick={handleRemove} className="btn btn-danger">
              Remove Connection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
