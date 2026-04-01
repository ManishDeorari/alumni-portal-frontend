import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import PointsDistributionModal from "./profile/PointsDistributionModal";
import { useTheme } from "@/context/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const { darkMode } = useTheme();
  const [currentYear, setCurrentYear] = useState([]);
  const [lastYear, setLastYear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch current & last year leaderboard
  const fetchLeaderboards = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

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
    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden mb-12 transition-all hover:shadow-blue-500/10">
      <div className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1.5rem-1px)] overflow-hidden`}>
        <div className={`px-10 py-6 ${darkMode ? "bg-[#FAFAFA]/5" : "bg-gray-50/50"} flex items-center justify-between`}>
          <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight`}>{title}</h2>
          <div className={`px-4 py-1.5 ${darkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"} rounded-xl shadow-lg`}>
            <span className="font-black text-[10px] uppercase tracking-widest">{users.length} Ranked</span>
          </div>
        </div>
        {/* Gradient Separator */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-sm"></div>
        <div className="p-6 md:p-10">
          {users.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-[#FAFAFA]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className={`${darkMode ? "text-blue-300" : "text-slate-500"} font-bold italic text-lg`}>No eligible users found for this rank.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {users.map((user, index) => (
                <div key={user._id} className="p-[1px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl shadow-xl transition-all hover:scale-[1.01]">
                  <li
                    className={`flex items-center justify-between ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1rem-1px)] p-5 group transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? "bg-yellow-500/30 text-yellow-500 border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]" :
                        index === 1 ? "bg-slate-300/30 text-slate-300 border-2 border-slate-300" :
                          index === 2 ? "bg-amber-600/30 text-amber-500 border-2 border-amber-600" :
                            darkMode ? "bg-[#FAFAFA]/10 text-white border border-white/10" : "bg-gray-100 text-slate-900 border-gray-200"
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
                          href={`/profile/${user.publicId || user._id}`}
                          className={`font-black text-xl ${darkMode ? "text-white" : "text-slate-900"} hover:text-blue-500 transition-colors block truncate`}
                        >
                          {user.name}
                        </Link>
                        <p className={`text-xs font-black ${darkMode ? "text-blue-300" : "text-slate-600"} tracking-widest uppercase`}>{user.enrollmentNumber || "Alumni"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePointClick(user)}
                      className={`px-6 py-3 ${darkMode ? "bg-blue-600/20 border-blue-500/30 text-blue-300" : "bg-blue-600 text-white border-blue-700"} hover:bg-blue-600 hover:text-white border rounded-xl font-black text-xl transition-all shadow-lg active:scale-95 flex items-center gap-2`}
                    >
                      {user[pointsKey]?.total ?? 0} <span className="text-xs uppercase tracking-tighter">pts</span>
                    </button>
                  </li>
                </div>
              ))}
            </ul>
          )}
        </div>
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
      <div className="p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2rem] shadow-2xl overflow-hidden">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} backdrop-blur-xl p-8 rounded-[calc(2rem-2px)] relative overflow-hidden`}>
          <div>
            <h1 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight mb-2 flex items-center gap-3`}>
              🏆 Alumni Leaderboard
            </h1>
            <p className={`${darkMode ? "text-blue-100/40" : "text-slate-500"} text-sm font-bold uppercase tracking-widest`}>Global Rankings &amp; Points breakdown</p>
          </div>
          <div className="relative w-full md:w-80 p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
            <div className="relative h-full">
              <input
                type="text"
                placeholder="Search by name or enrollment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-[#FAFAFA] text-black"} rounded-2xl outline-none transition-all font-medium`}
              />
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-white/20" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className={`${darkMode ? "text-blue-100/40" : "text-gray-400"} font-black uppercase tracking-widest text-xs`}>Loading Rankings...</p>
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
