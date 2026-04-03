"use client";
import React, { useState, useEffect } from "react";
import { fetchPendingPointsRequests, approvePointsRequest } from "../../../api/dashboard";
import toast from "react-hot-toast";
import PostModal from "../Post/Visual/PostModal";

const PointsRequestsList = ({ darkMode = false, user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [pointsOverrides, setPointsOverrides] = useState({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchPendingPointsRequests();
      setRequests(data);
    } catch (err) {
      toast.error("Failed to load points requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (postId, action) => {
    try {
      const awardedPoints = action === "approve" ? pointsOverrides[postId] : undefined;
      const res = await approvePointsRequest(postId, action, awardedPoints);
      if (res.message) {
        toast.success(res.message);
        setRequests(prev => prev.filter(r => r._id !== postId));
        setPointsOverrides(prev => {
          const newMap = { ...prev };
          delete newMap[postId];
          return newMap;
        });
      }
    } catch (err) {
      toast.error("Process failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className={`${darkMode ? "text-blue-300" : "text-slate-900"} font-black uppercase tracking-widest text-[10px]`}>Fetching pending requests...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-900"} flex items-center gap-3`}>
          <span className="p-2 bg-orange-600/20 rounded-xl text-orange-400">⚡</span>
          Pending Points Requests
        </h3>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          requests.length > 0 
            ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
            : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
        }`}>
          {requests.length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className={`p-10 text-center rounded-[2.5rem] border-2 border-dashed ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
          <p className={`text-sm font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>All requests have been processed! ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((post) => (
            <div key={post._id} className={`group relative p-[1px] rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-white border border-gray-100 shadow-sm hover:shadow-md"}`}>
              <div className={`p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center`}>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      post.type === "Session"
                        ? (darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600")
                        : (darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")
                    }`}>
                      {post.type === "Session" ? "🤝 Session" : "📢 Announcement"} by {post.user?.name || "Member"}
                    </span>
                    <span className={`text-[9px] font-bold opacity-40 uppercase`}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className={`text-sm font-bold leading-relaxed ${darkMode ? "text-gray-200" : "text-slate-800"} line-clamp-1`}>
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {post.type === "Session" ? (
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                      }`}>
                        <span className="text-xs">🎯</span>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
                            Campus Engagement
                          </span>
                          <span className="text-[8px] font-bold opacity-40 uppercase">Points for Session</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="30"
                            value={pointsOverrides[post._id] !== undefined ? pointsOverrides[post._id] : ""}
                            onChange={(e) => setPointsOverrides(prev => ({ ...prev, [post._id]: e.target.value }))}
                            className={`w-14 text-center rounded-lg text-[10px] font-black p-1 outline-none ${
                                darkMode ? "bg-black/20 text-blue-400 border border-blue-500/30" : "bg-white text-blue-600 border border-blue-200"
                            }`}
                          />
                          <span className="text-[10px] font-black text-blue-500 opacity-60 pt-0.5">pts</span>
                        </div>
                      </div>
                    ) : (
                      post.announcementDetails?.winners.map((w, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                          darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                        }`}>
                          <span className="text-xs">{(w.userId || (w.isGroup && w.groupMembers?.length > 0)) ? "✅" : "❓"}</span>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
                              {w.name}
                              {w.isGroup && <span className="ml-1 opacity-50">(Group)</span>}
                            </span>
                            {w.isGroup && w.groupMembers?.length > 0 && (
                              <span className="text-[8px] font-bold opacity-40 uppercase truncate max-w-[150px]">
                                {w.groupMembers.map(m => typeof m === 'object' ? m.name : m).join(", ")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-blue-500">+{w.points}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button 
                      onClick={() => handleAction(post._id, "approve")}
                      className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(post._id, "reject")}
                      className={`flex-1 lg:flex-none px-6 py-3 border ${darkMode ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-slate-600 hover:bg-gray-50"} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPost(post);
                        setShowPostModal(true);
                      }}
                      className={`hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-gray-500/10 text-gray-400 hover:text-white transition-colors`}
                      title="View Full Post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showPostModal && selectedPost && (
        <PostModal
          showModal={showPostModal}
          setShowModal={setShowPostModal}
          post={selectedPost}
          currentUser={user}
          darkMode={darkMode}
          // No-op handlers for read-only preview
          handleReact={() => {}}
          getReactionCount={() => 0}
          userReacted={() => false}
          handleComment={() => {}}
          handleDelete={() => {}}
          toggleEdit={() => {}}
        />
      )}
    </div>
  );
};

export default PointsRequestsList;
