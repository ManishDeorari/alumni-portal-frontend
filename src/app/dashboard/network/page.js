"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "@/api/connect";
import RequestsModal from "../../components/network/RequestsModal";
import { useTheme } from "@/context/ThemeContext";

const NetworkPage = () => {
  const { darkMode } = useTheme();
  const [alumni, setAlumni] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [requested, setRequested] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState({});
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
    // Check if at least one search parameter is provided
    if (!searchQuery.trim() && !filters.course && !filters.year && !filters.industry) {
      alert("Please enter a name or select a filter to search");
      return;
    }
    setAlumni([]); // Clear previous results immediately
    setSearched(true); // Track that a search was performed

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

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const userObj = currentUser || JSON.parse(localStorage.getItem("user"));
    setIsAdmin(userObj?.isAdmin || userObj?.role === "admin");
  }, [currentUser]);

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <SidebarComponent />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950/80 text-white' : 'bg-white/80 text-slate-900'} backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div>
              <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Network</h1>
              <p className={`text-sm ${darkMode ? 'text-blue-200/60' : 'text-slate-600'} font-medium`}>Build your professional circle with alumni</p>
            </div>
            <div className="flex gap-4">
              <div className="relative p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl group transition-all duration-300 hover:shadow-lg">
                <Link href="/dashboard/myconnections" className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all backdrop-blur-md ${darkMode ? 'bg-slate-900/90 text-white hover:bg-slate-800' : 'bg-white/90 text-slate-900 hover:bg-gray-50'}`}>
                  My Network
                  {currentUser?.connections?.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                      {currentUser.connections.length}
                    </span>
                  )}
                </Link>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl flex items-center gap-2 group active:scale-95 text-sm"
              >
                Requests
                {currentUser?.pendingRequests?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce font-black">
                    {currentUser.pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`px-10 py-10 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950/80' : 'bg-white/80'} backdrop-blur-xl space-y-8`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 relative p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl transition-all">
                <div className="relative h-full">
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all font-medium ${darkMode ? 'bg-slate-900 text-white placeholder-white/30' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
                  />
                  <svg className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-30`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95"
              >
                Search Alumni
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl transition-all">
                <select
                  value={filters.course}
                  onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                  className={`w-full pl-4 pr-10 py-3.5 rounded-2xl appearance-none outline-none font-bold text-[10px] uppercase tracking-widest cursor-pointer ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}
                >
                  <option value="">All Courses</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                </select>
                <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>

              <div className="relative p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl transition-all">
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className={`w-full pl-4 pr-10 py-3.5 rounded-2xl appearance-none outline-none font-bold text-[10px] uppercase tracking-widest cursor-pointer ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}
                >
                  <option value="">Graduation Year</option>
                  {Array.from({ length: 25 }, (_, i) => 2010 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>

              <div className="relative p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl transition-all">
                <input
                  type="text"
                  placeholder="Industry"
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className={`w-full px-4 py-3.5 rounded-2xl outline-none font-bold text-[10px] uppercase tracking-widest ${darkMode ? 'bg-slate-900 text-white placeholder-white/30' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searched && alumni.length === 0 ? (
          <div className={`p-10 rounded-[2.5rem] border border-dashed text-center ${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>No Results Found</h2>
          </div>
        ) : alumni.length > 0 && (
          <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className={`px-8 py-8 rounded-[calc(2.5rem-1px)] ${darkMode ? 'bg-black' : 'bg-white'} space-y-6`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Search Results</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {alumni.map((user) => (
                  <div key={user._id} className="relative p-[1px] bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-2xl group transition-all duration-500">
                    <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm relative overflow-hidden h-full ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border'}`}>
                      <div className="flex items-center gap-4 min-w-0 relative z-10">
                        <div className="relative p-[1px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0">
                          <Image
                            src={user.profilePicture || "/default-profile.jpg"}
                            alt={user.name || "User"}
                            width={56}
                            height={56}
                            className={`w-12 h-12 rounded-full object-cover border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/dashboard/profile?id=${user._id}`}>
                            <h3 className="font-black text-base truncate hover:text-blue-500 transition-colors">{user.name}</h3>
                          </Link>
                          <p className={`text-[9px] font-bold ${darkMode ? 'text-blue-100/40' : 'text-slate-500'}`}>{user.course} • {user.year}</p>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {user.connectionStatus === "connected" ? (
                          <span className="text-[9px] font-black uppercase text-green-500">Friends</span>
                        ) : (user.connectionStatus === "sent" || requested[user._id]) ? (
                          <span className="text-[9px] font-black uppercase text-gray-400">Sent</span>
                        ) : (
                          <button onClick={() => handleConnect(user._id)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-500 transition-all">Connect</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categorized Suggestions */}
        <div className="space-y-12 pb-20">
          {[
            { id: "randomRecommendations", title: "Random Recommendations", icon: "🎲", color: "blue", data: suggestions.randomRecommendations },
            { id: "facultyAndAdmin", title: "Faculty and Admin", icon: "🎓", color: "amber", data: suggestions.facultyAndAdmin },
            { id: "relatedPeople", title: "Based on Your Course", icon: "🤝", color: "purple", data: suggestions.relatedPeople }
          ].map((section) => (
            section.data?.length > 0 && (
              <div key={section.id} className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className={`px-8 py-8 rounded-[calc(2.5rem-1px)] ${darkMode ? 'bg-black' : 'bg-white'} space-y-6`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-1.5 rounded-full ${section.color === 'blue' ? 'bg-blue-600' : section.color === 'amber' ? 'bg-amber-500' : 'bg-purple-600'}`}></div>
                    <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{section.icon} {section.title}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section.data.map((user) => (
                      <div key={user._id} className="relative p-[1px] bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-2xl h-full group transition-all duration-500">
                        <div className={`rounded-2xl flex flex-col items-center text-center p-5 space-y-3 transition-all relative overflow-hidden h-full ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border'}`}>
                          <div className="relative p-[1px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shrink-0">
                            <Image
                              src={user.profilePicture || "/default-profile.jpg"}
                              alt={user.name || "User"}
                              width={64}
                              height={64}
                              className={`w-14 h-14 rounded-full object-cover border-2 ${darkMode ? 'border-slate-800' : 'border-white'}`}
                            />
                          </div>
                          <div className="w-full min-w-0">
                            <Link href={`/dashboard/profile?id=${user._id}`}>
                              <h3 className="font-black text-sm truncate hover:text-blue-500 transition-colors px-1">{user.name}</h3>
                            </Link>
                            <p className={`text-[9px] font-bold ${darkMode ? 'text-blue-100/40' : 'text-slate-500'}`}>{user.course} • {user.year}</p>
                          </div>
                          <button
                            onClick={() => handleConnect(user._id)}
                            disabled={requested[user._id]}
                            className={`w-full py-2 rounded-xl text-[9px] font-black uppercase transition-all ${requested[user._id] ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                          >
                            {requested[user._id] ? "Pending" : "Connect"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
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
