"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/Post/PostCard";
import { useTheme } from "@/context/ThemeContext";
import { GooeyGradientBackground } from "../../components/GooeyGradientBackground";

export default function MyActivityPage() {
  const { darkMode } = useTheme();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActivity(data); // ✅ already sorted in backend
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching activity:", error.message);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="font-black tracking-widest text-[10px] uppercase opacity-50">Loading activity...</p>
      </div>
    </div>
  );

  return (
    <GooeyGradientBackground className="min-h-screen text-white" darkMode={darkMode}>
      <Sidebar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl mb-10 overflow-hidden">
          <div className={`px-8 py-6 rounded-[calc(1.5rem-1px)] ${darkMode ? 'bg-slate-950' : 'bg-[#FAFAFA]'}`}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>MY ACTIVITY</h1>
            </div>
          </div>
        </div>

        {activity.length > 0 ? (
          <div className="space-y-12">
            {activity.map((act, idx) => (
              <div key={idx} className="space-y-4">
                <div className={`p-5 rounded-2xl border backdrop-blur-md ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {act.type === "reaction" && <>You reacted <b>{act.reaction}</b></>}
                    {act.type === "comment" && (
                      <>You commented: <i className="opacity-70 normal-case ml-2">&quot;{String(act.text || "")}&quot;</i></>
                    )}
                    {act.type === "reply" && (
                      <>You replied: <i className="opacity-70 normal-case ml-2">&quot;{String(act.text || "")}&quot;</i></>
                    )}
                  </p>
                </div>
                {act.post && <PostCard post={act.post} darkMode={darkMode} />}
              </div>
            ))}
          </div>
        ) : (
          <div className={`py-24 text-center rounded-[3rem] border border-white/10 backdrop-blur-md ${darkMode ? 'bg-slate-950/50' : 'bg-[#FAFAFA]/10'}`}>
            <h2 className="text-2xl font-black text-white/80 uppercase tracking-widest">No activity yet.</h2>
            <p className="text-white/60 mt-3 font-medium">Your interactions will be logged here.</p>
          </div>
        )}
      </div>
    </GooeyGradientBackground>
  );
}
