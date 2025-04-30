"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ViewUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://alumni-backend-d9k9.onrender.com/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUser(data);
    };

    fetchUser();
  }, [id]);

  if (!user) return <p className="text-center p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 p-6 text-white">
      <div className="max-w-xl mx-auto bg-white text-gray-800 rounded p-6 shadow">
        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Enrollment: {user.enrollmentNumber}</p>
        <p>Bio: {user.bio || "No bio yet."}</p>
      </div>
    </div>
  );
}
