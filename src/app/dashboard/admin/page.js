"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/AdminSidebar"; // adjust path if needed
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import PendingUsers from "../../components/admin/PendingUsers";
import AdminsManager from "../../components/admin/AdminsManager";
import Leaderboard from "../../components/Leaderboard";
import PointsSystemManagement from "../../components/admin/PointsSystemManagement";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending | admins | leaderboard | points
  const [loading, setLoading] = useState(true);

  // Pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Admins / Faculty list
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Points Manager
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [pointsCategory, setPointsCategory] = useState("profileCompletion");
  const [pointsValue, setPointsValue] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // Fetch current user & protect admin routes
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = getToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }
      try {
        const res = await fetch(`${API}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unauthorized");
        setUser(data);

        if (!data.isAdmin) {
          toast.error("Access denied — admin only");
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error("fetch current user error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [router]);

  // Fetch helpers
  const fetchPendingUsers = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending users");
      setPendingUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load pending users");
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchAdminsList = async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("GET /api/admin/admins:", txt);
        setAdminsList([]);
        return;
      }
      const data = await res.json();
      setAdminsList(data);
    } catch (err) {
      console.error(err);
      setAdminsList([]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/leaderboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch leaderboard");
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") fetchPendingUsers();
    if (activeTab === "admins") fetchAdminsList();
    if (activeTab === "leaderboard") fetchLeaderboard();
  }, [activeTab]);

  // Actions
  const approveUser = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approve failed");
      toast.success(data.message || "Approved");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Approve failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API}/api/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success(data.message || "User deleted");
      fetchPendingUsers();
      fetchAdminsList();
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  const promoteToAdmin = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/make-admin/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Promote failed");
      toast.success(data.message || "Promoted to admin");
      fetchAdminsList();
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Promote failed");
    }
  };

  const demoteAdmin = async (id) => {
    const target = adminsList.find(u => u._id === id);
    if (target?.isMainAdmin) {
      toast.error("Cannot demote the Main Admin!");
      return;
    }

    if (!window.confirm("Are you sure you want to demote this admin back to faculty?")) return;

    try {
      const res = await fetch(`${API}/api/admin/remove-admin/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Demote failed");
      toast.success(data.message || "Demoted");
      fetchAdminsList();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Demote failed");
    }
  };

  const assignPoints = async (e) => {
    e.preventDefault();
    if (!selectedUserForPoints) {
      toast.error("Select a user to assign points");
      return;
    }
    setPointsLoading(true);
    try {
      const res = await fetch(`${API}/api/admin-points/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserForPoints._id,
          category: pointsCategory,
          value: Number(pointsValue),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Assign failed");
      toast.success("Points updated");
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Assign failed");
    } finally {
      setPointsLoading(false);
    }
  };

  const resetAllPoints = async () => {
    if (!window.confirm("Reset all users' points? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/admin-points/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      toast.success("All points reset");
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Reset failed");
    }
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md ${activeTab === id ? "bg-white text-gray-900 font-semibold" : "bg-white/10 text-white"
        }`}
    >
      {label}
    </button>
  );

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <Sidebar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header & Tabs */}
        <section className="mb-6">
          <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/80">
                Signed in as <strong>{user?.name}</strong> ({user?.email})
              </p>
            </div>

            <div className="flex gap-2">
              <TabButton id="pending" label="Pending Users" />
              <TabButton id="admins" label="Manage Admins" />
              <TabButton id="leaderboard" label="Leaderboard" />
              {user?.isMainAdmin && <TabButton id="points" label="Points System" />}
            </div>
          </div>
        </section>

        <section>
          {/* MANAGE ReEQUEST */}
          {activeTab === "pending" && (
            <PendingUsers
              pendingUsers={pendingUsers}
              pendingLoading={pendingLoading}
              approveUser={approveUser}
              deleteUser={deleteUser}
              promoteToAdmin={promoteToAdmin}
            />
          )}

          {/* MANAGE ADMINS */}
          {activeTab === "admins" && (
            <AdminsManager
              adminsList={adminsList}
              adminsLoading={adminsLoading}
              promoteToAdmin={promoteToAdmin}
              demoteAdmin={demoteAdmin}
              deleteUser={deleteUser}
            />
          )}

          {/* LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <Leaderboard
              currentYearData={leaderboard.filter(u => u.year === "current")}
              lastYearData={leaderboard.filter(u => u.year === "last")}
              loading={leaderboardLoading}
            />
          )}

          {/* POINTS SYSTEM */}
          {activeTab === "points" && user?.isMainAdmin && (
            <PointsSystemManagement />
          )}
        </section>
      </main>
    </div>
  );
}
