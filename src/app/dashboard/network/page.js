"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "@/api/connect";
import RequestsModal from "../../components/network/RequestsModal";

const NetworkPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [requested, setRequested] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    course: "",
    year: "",
    industry: ""
  });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      // Get current user
      const meRes = await fetch(`${BASE_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      setCurrentUser(meData);

      // Get suggestions
      const suggRes = await fetch(`${BASE_URL}/api/connect/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const suggData = await suggRes.json();
      setSuggestions(suggData || []);
    } catch (err) {
      console.error("Fetch initial data error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConnect = async (toUserId) => {
    try {
      await sendConnectionRequest(toUserId);
      setRequested((prev) => ({ ...prev, [toUserId]: true }));
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a name or keyword to search");
      return;
    }
    const token = localStorage.getItem("token");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    let url = `${BASE_URL}/api/connect/search?query=${searchQuery}`;
    if (filters.course) url += `&course=${filters.course}`;
    if (filters.year) url += `&year=${filters.year}`;
    if (filters.industry) url += `&industry=${filters.industry}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAlumni(data || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <Sidebar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-800/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Network</h1>
            <p className="text-blue-100/60 font-medium">Build your professional circle with alumni</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <Link href="/dashboard/myconnections" className="relative group px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur-md shadow-lg flex items-center gap-3">
              My Network
              {currentUser?.connections?.length > 0 && (
                <span className="bg-blue-500 text-white text-[11px] px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {currentUser.connections.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative px-6 py-3 bg-white text-blue-700 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl flex items-center gap-3 group active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Requests
              {currentUser?.pendingRequests?.length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[11px] w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce font-black">
                  {currentUser.pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Search & Filters */}
        <section className="bg-gray-800/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={searchQuery}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-white/30"
              />
              <svg className="absolute left-4 top-4 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button
              onClick={handleSearch}
              className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              Search Alumni
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Course</label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-900">All Courses</option>
                <option value="B.Tech" className="text-gray-900">B.Tech</option>
                <option value="M.Tech" className="text-gray-900">M.Tech</option>
                <option value="MBA" className="text-gray-900">MBA</option>
                <option value="BCA" className="text-gray-900">BCA</option>
                <option value="MCA" className="text-gray-900">MCA</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Graduation Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-900">All Years</option>
                {Array.from({ length: 25 }, (_, i) => 2010 + i).map(y => (
                  <option key={y} value={y} className="text-gray-900">{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Industry</label>
              <input
                type="text"
                placeholder="e.g. IT, Finance"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/20"
              />
            </div>
          </div>
        </section>

        {/* Search Results - MOVED ABOVE RECOMMENDATIONS */}
        {alumni.length > 0 && (
          <section className="bg-gray-800/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Search Results</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {alumni.map((user) => (
                <div key={user._id} className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 flex items-center justify-between gap-5 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>

                  <div className="flex items-center gap-5 min-w-0 relative z-10">
                    <img
                      src={user.profilePicture || "/default-profile.jpg"}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-200 flex-shrink-0 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="min-w-0">
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <h3 className="font-extrabold text-white text-xl group-hover:text-blue-300 transition-colors truncate">{user.name}</h3>
                      </Link>
                      <p className="text-blue-100/60 font-medium truncate">{user.course} • {user.year}</p>
                      <p className="text-[11px] text-blue-400 font-bold uppercase tracking-[0.15em] mt-2 truncate bg-blue-400/10 w-fit px-3 py-1 rounded-full">{user.workProfile?.industry || "Alumni"}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    {user.connectionStatus === "connected" ? (
                      <span className="px-5 py-2.5 bg-green-500/20 text-green-300 rounded-2xl text-sm font-black flex items-center gap-2 border border-green-500/30">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Friends
                      </span>
                    ) : user.connectionStatus === "sent" || requested[user._id] ? (
                      <span className="px-5 py-2.5 bg-white/5 text-white/30 rounded-2xl text-sm font-bold border border-white/5 italic">
                        Request Sent
                      </span>
                    ) : user.connectionStatus === "pending" ? (
                      <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-amber-400 text-amber-950 rounded-2xl text-sm font-black hover:bg-amber-300 transition-all shadow-lg animate-pulse ring-4 ring-amber-400/20">
                        Respond
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(user._id)}
                        className="px-6 py-2.5 bg-white text-blue-700 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95 shadow-white/10"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Suggestions - WRAPPED IN DARK GLASS DIV */}
        {suggestions.length > 0 && (
          <section className="bg-gray-800/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((user) => (
                <div key={user._id} className="bg-gray-900/40 backdrop-blur-xl hover:bg-gray-900/60 rounded-[2rem] border border-white/5 hover:border-amber-400/50 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-2xl">
                  <div className="h-24 bg-gradient-to-br from-blue-500/10 to-purple-600/10 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-colors duration-500"></div>
                  <div className="px-6 pb-6 -mt-12 text-center relative z-10">
                    <img
                      src={user.profilePicture || "/default-profile.jpg"}
                      className="w-24 h-24 rounded-3xl border-4 border-white/10 mx-auto object-cover bg-gray-800 shadow-xl group-hover:scale-110 transition-transform duration-500 hover:rotate-3"
                    />
                    <div className="mt-4">
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <h3 className="font-extrabold text-white text-lg group-hover:text-amber-200 transition-colors truncate px-2">{user.name}</h3>
                      </Link>
                      <p className="text-xs text-blue-100/60 font-medium truncate mt-1">{user.course || "Alumni"}</p>
                      <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{user.workProfile?.industry || "Networking"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(user._id)}
                      disabled={requested[user._id]}
                      className={`w-full mt-6 py-3 rounded-2xl text-sm font-black transition-all shadow-md group-hover:shadow-xl ${requested[user._id]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-amber-400 text-amber-950 hover:bg-amber-300 active:scale-95 shadow-amber-400/20"
                        }`}
                    >
                      {requested[user._id] ? "Request Sent" : "Connect Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <RequestsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionComplete={fetchData}
      />
    </div>
  );
};

export default NetworkPage;
