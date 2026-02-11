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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <Sidebar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-70"></div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Network</h1>
            <p className="text-blue-100/60 font-medium">Build your professional circle with alumni</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <Link href="/dashboard/myconnections" className="relative group px-6 py-3 bg-white/10 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all shadow-lg backdrop-blur-md flex items-center gap-3">
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
        <section className="bg-black/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-lg space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={searchQuery}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-white/30 shadow-inner"
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

        {/* Search Results */}
        {searched && alumni.length === 0 ? (
          <section className="bg-black/20 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/10 shadow-lg text-center animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 bg-white/5 rounded-full border border-white/10 shadow-inner">
                <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">No Result</h2>
                <p className="text-white/40 font-medium max-w-xs mx-auto mt-2">Try adjusting your filters or search keywords to find what you&apos;re looking for.</p>
              </div>
            </div>
          </section>
        ) : alumni.length > 0 && (
          <section className="bg-black/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-lg space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-60"></div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Search Results</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {alumni.map((user) => (
                <div key={user._id} className="bg-black/40 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10 flex items-center justify-between gap-5 shadow-xl hover:shadow-2xl hover:border-blue-400/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>

                  <div className="flex items-center gap-5 min-w-0 relative z-10">
                    <img
                      src={user.profilePicture || "/default-profile.jpg"}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-gray-800 flex-shrink-0 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="min-w-0">
                      <Link href={`/dashboard/profile?id=${user._id}`}>
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

        {/* Categorized Suggestions */}
        <div className="space-y-12">
          {[
            { id: "randomRecommendations", title: "Random Recommendations", icon: "🎲", color: "blue", data: suggestions.randomRecommendations, emptyMsg: "No recommendations found." },
            { id: "facultyAndAdmin", title: "Faculty and Admin", icon: "🎓", color: "amber", data: suggestions.facultyAndAdmin, emptyMsg: "No faculty or admin found." },
            { id: "relatedPeople", title: "Based on Your Course", icon: "🤝", color: "purple", data: suggestions.relatedPeople, emptyMsg: "No related alumni found." }
          ].map((section) => (
            <section key={section.id} className="bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${section.color === 'blue' ? 'from-blue-600' : section.color === 'amber' ? 'from-amber-500' : 'from-purple-600'} via-transparent to-transparent opacity-80`}></div>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-1.5 ${section.color === 'blue' ? 'bg-blue-600' : section.color === 'amber' ? 'bg-amber-500' : 'bg-purple-600'} rounded-full`}></div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">{section.icon} {section.title}</h2>
              </div>

              {!section.data || section.data.length === 0 ? (
                <div className="py-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-white/40 font-bold uppercase tracking-widest text-sm">{section.emptyMsg}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.data.map((user) => (
                    <div key={user._id} className="bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden group shadow-lg hover:shadow-2xl relative">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${section.color === 'blue' ? 'bg-blue-500/10' : section.color === 'amber' ? 'bg-amber-500/10' : 'bg-purple-500/10'} rounded-full -mr-12 -mt-12 group-hover:bg-opacity-20 transition-colors`}></div>

                      <div className="p-6 flex items-center gap-5 relative z-10">
                        <img
                          src={user.profilePicture || "/default-profile.jpg"}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-md"
                        />
                        <div className="min-w-0">
                          <Link href={`/dashboard/profile?id=${user._id}`}>
                            <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors truncate">{user.name}</h3>
                          </Link>
                          {user.role === 'admin' || user.role === 'faculty' ? (
                            <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mt-1">{user.role}</p>
                          ) : (
                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mt-1">{user.course}</p>
                          )}
                        </div>
                      </div>

                      <div className="px-6 pb-6 relative z-10">
                        <button
                          onClick={() => handleConnect(user._id)}
                          disabled={requested[user._id]}
                          className={`w-full py-3 rounded-xl text-xs font-black transition-all ${requested[user._id]
                            ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                            : section.color === 'blue' ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                              : section.color === 'amber' ? "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20"
                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                            } active:scale-95`}
                        >
                          {requested[user._id] ? "Request Sent" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
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
