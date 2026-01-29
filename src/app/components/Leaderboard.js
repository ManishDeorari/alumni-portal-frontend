import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import PointsDistributionModal from "./profile/PointsDistributionModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const [currentYear, setCurrentYear] = useState([]);
  const [lastYear, setLastYear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch current & last year leaderboard
  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const [resCurrent, resLast] = await Promise.all([
        fetch(`${API}/api/admin/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/leaderboard/last-year`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!resCurrent.ok) throw new Error("Failed to fetch current year leaderboard");
      if (!resLast.ok) throw new Error("Failed to fetch last year leaderboard");

      const currentData = await resCurrent.json();
      const lastData = await resLast.json();

      setCurrentYear(currentData);
      setLastYear(lastData);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const filterUsers = (users) =>
    users.filter((u) =>
      `${u.name} ${u.enrollmentNumber || ""}`.toLowerCase().includes(search.toLowerCase())
    );

  const currentFiltered = filterUsers(currentYear);
  const lastFiltered = filterUsers(lastYear);

  const handlePointClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const Card = ({ title, users, pointsKey }) => (
    <div className="bg-gray-800/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.4)] mb-12 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="px-10 py-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <span className="text-blue-300 font-black text-[10px] uppercase tracking-widest">{users.length} Ranked</span>
        </div>
      </div>
      <div className="p-6 md:p-10">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-blue-100/30 font-bold italic text-lg">No eligible users found for this rank.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {users.map((user, index) => (
              <li
                key={user._id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg group hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)]" :
                    index === 1 ? "bg-slate-300/20 text-slate-300 border border-slate-300/40" :
                      index === 2 ? "bg-amber-600/20 text-amber-500 border border-amber-600/40" :
                        "text-blue-100/40"
                    }`}>
                    {index + 1}
                  </div>
                  <Image
                    src={user.profilePicture || "/default-profile.jpg"}
                    alt={user.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 bg-gray-800 shadow-xl group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/profile?id=${user._id}`}
                      className="font-extrabold text-lg text-white hover:text-blue-300 transition-colors block truncate"
                    >
                      {user.name}
                    </Link>
                    <p className="text-xs font-black text-blue-100/30 tracking-widest uppercase">{user.enrollmentNumber || "Alumni"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePointClick(user)}
                  className="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl font-black text-lg transition-all shadow-lg active:scale-95"
                >
                  {user[pointsKey]?.total ?? 0} <span className="text-[10px] uppercase ml-1 opacity-60">pts</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-800/90 p-8 rounded-[2rem] border border-white/20 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            🏆 Alumni Leaderboard
          </h1>
          <p className="text-blue-100/40 text-sm font-bold uppercase tracking-widest">Global Rankings & Points breakdown</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or enrollment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-white/20 font-medium"
          />
          <svg className="absolute left-4 top-4 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-100/40 font-black uppercase tracking-widest text-xs">Loading Rankings...</p>
        </div>
      ) : (
        <>
          <Card title="🥇 Current Season" users={currentFiltered} pointsKey="points" />
          <Card title="🎓 Historical Hall of Fame" users={lastFiltered} pointsKey="lastYearPoints" />
        </>
      )}

      {selectedUser && (
        <PointsDistributionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
        />
      )}
    </motion.div>
  );
}
