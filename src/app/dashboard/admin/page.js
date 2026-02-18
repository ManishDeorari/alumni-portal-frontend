"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"; // adjust path if needed
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Shield, Users, Trophy, Download, Settings, Clock } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import PendingUsers from "../../components/admin/PendingUsers";
import AdminsManager from "../../components/admin/AdminsManager";
import Leaderboard from "../../components/Leaderboard";
import PointsSystemManagement from "../../components/admin/PointsSystemManagement";
import AlumniExport from "../../components/admin/AlumniExport";
import UserManagement from "../../components/admin/UserManagement";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending | admins | leaderboard | points | export | users
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

  // All Users (for User Management)
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

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
  const fetchPendingUsers = React.useCallback(async () => {
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
  }, []);

  const fetchAdminsList = React.useCallback(async () => {
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
  }, []);

  const fetchLeaderboard = React.useCallback(async () => {
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
  }, []);

  const fetchAllUsers = React.useCallback(async () => {
    setAllUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch all users");
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load all users");
    } finally {
      setAllUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "pending") fetchPendingUsers();
    if (activeTab === "admins") fetchAdminsList();
    if (activeTab === "leaderboard") fetchLeaderboard();
    if (activeTab === "users") fetchAllUsers();
  }, [activeTab, fetchAdminsList, fetchLeaderboard, fetchPendingUsers, fetchAllUsers]);

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

  const deleteUser = async (id, isBulk = false) => {
    if (!isBulk && !window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API}/api/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      if (!isBulk) {
        toast.success(data.message || "User deleted");
        fetchPendingUsers();
        fetchAdminsList();
        fetchLeaderboard();
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
      if (!isBulk) toast.error(err.message || "Delete failed");
      throw err;
    }
  };

  const bulkApproveUsers = async (ids) => {
    try {
      await Promise.all(ids.map(id =>
        fetch(`${API}/api/admin/approve/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then(r => r.json().then(d => { if (!r.ok) throw new Error(d.message); }))
      ));
      toast.success(`Successfully approved ${ids.length} users!`, { autoClose: 2000 });
      fetchPendingUsers();
    } catch (err) {
      toast.error("Some approvals failed. Please check list.");
      fetchPendingUsers();
    }
  };

  const bulkDeleteUsers = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteUser(id, true)));
      toast.success(`Successfully deleted ${ids.length} users!`, { autoClose: 2000 });
      fetchPendingUsers();
      fetchAdminsList();
      fetchLeaderboard();
      fetchAllUsers();
    } catch (err) {
      toast.error("Some deletions failed. Please check list.");
      fetchPendingUsers();
      fetchAdminsList();
      fetchLeaderboard();
      fetchAllUsers();
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

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-2.5 rounded-2xl transition-all duration-300 font-bold text-sm shadow-lg ${activeTab === id
        ? "bg-white text-blue-700 scale-105 shadow-white/10"
        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
        }`}
    >
      {label}
    </button>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <p className="font-black uppercase tracking-widest text-xs opacity-50">Initializing Admin Panel</p>
    </div>
  );

  // Choose sidebar
  const SidebarComponent = user?.isAdmin || user?.role === 'admin' ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative">
      <SidebarComponent />

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10 space-y-8">
        {/* Header & Tabs */}
        <section className="bg-gray-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in duration-700">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/20 shadow-inner">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">Admin Panel</h1>
                <p className="text-blue-100/40 text-xs font-bold uppercase tracking-widest mt-1">
                  Master Control Center
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-2 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5">
              <TabButton id="pending" label="Pending" />
              {user?.isMainAdmin && <TabButton id="users" label="User Mgmt" />}
              <TabButton id="admins" label="Admins" />
              <TabButton id="leaderboard" label="Leaderboard" />
              <TabButton id="export" label="Export" />
              {user?.isMainAdmin && <TabButton id="points" label="Points" />}
            </nav>
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
          {/* MANAGE ReEQUEST */}
          {activeTab === "pending" && (
            <PendingUsers
              pendingUsers={pendingUsers}
              pendingLoading={pendingLoading}
              approveUser={approveUser}
              deleteUser={deleteUser}
              promoteToAdmin={promoteToAdmin}
              bulkApproveUsers={bulkApproveUsers}
              bulkDeleteUsers={bulkDeleteUsers}
            />
          )}

          {/* USER MANAGEMENT */}
          {activeTab === "users" && (
            <UserManagement
              users={allUsers}
              loading={allUsersLoading}
              onDelete={deleteUser}
              onRefresh={fetchAllUsers}
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

          {/* ALUMNI EXPORT */}
          {activeTab === "export" && (
            <AlumniExport />
          )}
        </section>
      </main>
    </div>
  );
}
