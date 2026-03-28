"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { fetchEventRegistrations, downloadEventCSV } from "../../../api/dashboard";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

const AdminRegistrationsModal = ({ event, isOpen, onClose, darkMode = false }) => {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState({ totalCount: 0, registrations: [] });

  useEffect(() => {
    if (isOpen && event?._id) {
      loadRegistrations();
    }
  }, [isOpen, event?._id]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await fetchEventRegistrations(event._id);
      setData(result);
    } catch (err) {
      toast.error("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await downloadEventCSV(event._id, event.title);
      toast.success("CSV download started!");
    } catch (err) {
      toast.error("Failed to download CSV.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative w-full max-w-3xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"} border rounded-[2rem] shadow-2xl overflow-hidden my-auto`}
        >
          <div className={`px-8 py-6 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Event Registrations</h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{event.title} • Total: {data.totalCount}</p>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={handleDownloadCSV}
                disabled={isDownloading}
                className={`px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-md ${isDownloading ? "opacity-50 cursor-wait" : "hover:bg-green-700 active:scale-95"}`}
              >
                {isDownloading ? "⏳ Downloading..." : "📊 Download CSV"}
              </button>
              <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500 transition-colors">&times;</button>
            </div>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : data.registrations.length === 0 ? (
            <div className="text-center py-10 opacity-50">No registrations yet.</div>
          ) : (
            <div className="space-y-4">
              {data.registrations.map((reg, idx) => (
                <div key={reg._id} className={`p-4 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} flex items-center gap-4`}>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                    <Image src={reg.userId?.profilePicture || "/default-profile.jpg"} alt={reg.userId?.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{reg.userId?.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} truncate`}>{reg.userId?.email} {reg.isGroup && <span className="text-blue-500 font-bold ml-1">Group Registration</span>}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{new Date(reg.registeredAt).toLocaleDateString()}</p>
                    <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{new Date(reg.registeredAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminRegistrationsModal;
