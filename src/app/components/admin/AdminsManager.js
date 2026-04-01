"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function AdminsManager({
  adminsList,
  adminsLoading,
  promoteToAdmin,
  demoteAdmin,
  deleteUser,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState([]);

  const filter = (predicate) =>
    adminsList.filter(
      (u) =>
        predicate(u) &&
        `${u.name} ${u.email} ${u.employeeId || ""} ${u.enrollmentNumber || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  const admins = filter((u) => u.isAdmin);
  const faculty = filter((u) => !u.isAdmin);

  /* ---------------- SELECTION ---------------- */

  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (users) => {
    const ids = users.map((u) => u._id);
    const allSelected = ids.every((id) => selected.includes(id));

    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );
  };

  /* ---------------- BULK ACTIONS ---------------- */

  const bulkPromote = async () => {
    for (const id of selected) await promoteToAdmin(id);
    setSelected([]);
  };

  const bulkDemote = async () => {
    for (const id of selected) await demoteAdmin(id);
    setSelected([]);
  };

  const bulkDelete = async () => {
    for (const id of selected) await deleteUser(id);
    setSelected([]);
  };

  /* ---------------- CARD ---------------- */

  const Card = ({ title, users, badge, children, actions }) => (
    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all hover:shadow-blue-500/10">
      <div className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1.5rem-1px)] overflow-hidden`}>
        <div className={`flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b ${darkMode ? "border-white/10 bg-[#FAFAFA]/5" : "border-gray-200 bg-gray-50/50"}`}>
          <h3 className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} text-xl flex items-center gap-3`}>
            {title}
            <span className={`text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${badge}`}>
              {users.length}
            </span>
          </h3>
          <div className="mt-4 sm:mt-0">
            {actions}
          </div>
        </div>
        <div className="p-2 sm:p-4">
          {users.length === 0 ? (
            <div className="py-20 text-center">
              <p className={`${darkMode ? "text-blue-100/30" : "text-gray-400"} font-bold italic`}>No users found in this category.</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        key="admins"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} backdrop-blur-xl p-8 rounded-[calc(2rem-2px)] relative overflow-hidden`}>
            <div className="relative flex-1 max-w-md p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
              <div className="relative h-full">
                <input
                  type="text"
                  placeholder="Search by name, email, ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-[#FAFAFA] text-black"} rounded-2xl outline-none transition-all font-medium`}
                />
                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-white/30" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <p className={`${darkMode ? "text-blue-300" : "text-blue-600"} text-sm font-black uppercase tracking-widest`}>
              Managing {adminsList.length} total staff
            </p>
          </div>
        </div>

        {adminsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-100/40 font-black uppercase tracking-widest text-xs">Fetching users...</p>
          </div>
        ) : (
          <>
            {/* 🛡️ ADMINS */}
            <Card
              title="🛡️ Admins"
              users={admins}
              badge={darkMode ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"}
              actions={
                admins.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-demote" })}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Demote ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-delete" })}
                      className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-sm font-black border border-red-500/30 transition-all disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            >
              <Table
                users={admins}
                selected={selected}
                toggleUser={toggleUser}
                toggleSelectAll={toggleSelectAll}
                type="admin"
                onDemote={(u) => setConfirm({ action: "demote", user: u })}
                onDelete={(u) => setConfirm({ action: "delete", user: u })}
              />
            </Card>

            {/* 🏫 FACULTY */}
            <Card
              title="🏫 Faculty"
              users={faculty}
              badge={darkMode ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-green-100 text-green-700 border border-green-200"}
              actions={
                faculty.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-promote" })}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Promote ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-delete" })}
                      className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-sm font-black border border-red-500/30 transition-all disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            >
              <Table
                users={faculty}
                selected={selected}
                toggleUser={toggleUser}
                toggleSelectAll={toggleSelectAll}
                type="faculty"
                onPromote={(u) => setConfirm({ action: "promote", user: u })}
                onDelete={(u) => setConfirm({ action: "delete", user: u })}
              />
            </Card>
          </>
        )}
      </motion.div>

      {/* ---------------- CONFIRM MODAL ---------------- */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`${darkMode ? "bg-gray-900 border-white/20" : "bg-[#FAFAFA] border-gray-200"} border rounded-[2rem] p-8 w-full max-w-md shadow-2xl`}
            >
              <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} mb-4`}>
                {confirm.action.replace("bulk-", "").toUpperCase()}?
              </h3>

              {confirm.user && (
                <div className={`${darkMode ? "bg-[#FAFAFA]/5 border-white/10" : "bg-gray-50 border-gray-200"} p-4 rounded-xl border mb-6`}>
                  <p className={`font-bold ${darkMode ? "text-white" : "text-slate-900"} text-lg`}>{confirm.user.name}</p>
                  <p className={`${darkMode ? "text-blue-100/60" : "text-slate-500"} text-sm truncate`}>{confirm.user.email}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 font-black">
                <button
                  onClick={() => setConfirm(null)}
                  className={`px-6 py-3 ${darkMode ? "bg-[#FAFAFA]/5 hover:bg-[#FAFAFA]/10 text-white border-white/10" : "bg-gray-100 hover:bg-gray-200 text-slate-900 border-gray-200"} rounded-2xl border transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirm.action === "bulk-promote") await bulkPromote();
                    if (confirm.action === "bulk-demote") await bulkDemote();
                    if (confirm.action === "bulk-delete") await bulkDelete();

                    if (confirm.action === "promote") await promoteToAdmin(confirm.user._id);
                    if (confirm.action === "demote") await demoteAdmin(confirm.user._id);
                    if (confirm.action === "delete") await deleteUser(confirm.user._id);

                    setConfirm(null);
                  }}
                  className={`px-8 py-3 text-white rounded-2xl shadow-xl active:scale-95 transition-all ${confirm.action.includes("delete") ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
                    }`}
                >
                  Yes, Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- TABLE ---------------- */
function Table({
  users,
  selected,
  toggleUser,
  toggleSelectAll,
  onPromote,
  onDemote,
  onDelete,
  type,
}) {
  const { darkMode } = useTheme();
  if (users.length === 0) return null;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead>
          <tr className={`${darkMode ? "text-white border-white/10 bg-[#FAFAFA]/5" : "text-slate-900 border-gray-100 bg-gray-50"} text-[10px] uppercase font-black tracking-[0.2em] border-b`}>
            <th className="py-4 px-6 text-left">
              <input
                type="checkbox"
                className="w-5 h-5 bg-[#FAFAFA]/5 border-white/10 rounded cursor-pointer accent-blue-500"
                checked={users.every((u) => selected.includes(u._id))}
                onChange={() => toggleSelectAll(users)}
              />
            </th>
            <th className="py-4 px-6 text-left">User Profile</th>
            <th className="py-4 px-6 text-left md:table-cell hidden">Identification</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className={`${darkMode ? "divide-white/5" : "divide-gray-100"}`}>
          {users.map((u) => (
            <tr key={u._id} className={`group ${darkMode ? "hover:bg-[#FAFAFA]/5" : "hover:bg-gray-50"} transition-all`}>
              <td className="py-5 px-6">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-[#FAFAFA]/5 border-white/10 rounded cursor-pointer accent-blue-500"
                  checked={selected.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                  disabled={u.isMainAdmin}
                />
              </td>

              <td className="py-5 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} truncate`}>{u.name}</p>
                    <p className={`text-xs ${darkMode ? "text-blue-100/40" : "text-slate-500"} truncate`}>{u.email}</p>
                  </div>
                </div>
              </td>

              <td className="py-5 px-6 md:table-cell hidden">
                <span className={`text-xs font-black ${darkMode ? "text-blue-100/60 bg-[#FAFAFA]/5 border-white/5" : "text-slate-600 bg-gray-100 border-gray-200"} px-3 py-1.5 rounded-lg border whitespace-nowrap`}>
                  {u.employeeId || u.enrollmentNumber || "—"}
                </span>
              </td>

              <td className="py-5 px-6 text-right space-x-2">
                {onPromote && (
                  <button
                    onClick={() => onPromote(u)}
                    className="p-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                    title="Promote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </button>
                )}

                {onDemote && !u.isMainAdmin && (
                  <button
                    onClick={() => onDemote(u)}
                    className="p-2.5 bg-amber-600/10 hover:bg-amber-600 border border-amber-500/20 text-amber-500 hover:text-white rounded-xl transition-all active:scale-90"
                    title="Demote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                )}

                {u.isMainAdmin && (
                  <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                    Main Admin
                  </span>
                )}

                <button
                  onClick={() => onDelete(u)}
                  className="p-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all active:scale-90"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
