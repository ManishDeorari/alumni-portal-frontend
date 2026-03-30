"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function PendingUsers({
  pendingUsers,
  pendingLoading,
  approveUser,
  deleteUser,
  promoteToAdmin,
  bulkApproveUsers,
  bulkDeleteUsers,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState([]);

  // Safety filter
  const safePendingUsers = pendingUsers.filter(u =>
    !u.isMainAdmin &&
    u.email !== "admin@alumniportal.com" &&
    u.email !== "manishdeorari377@gmail.com"
  );

  const filterUsers = (role) =>
    pendingUsers.filter(
      (u) =>
        u.role === role &&
        `${u.name} ${u.email} ${u.enrollmentNumber || ""} ${u.employeeId || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  const alumni = filterUsers("alumni");
  const faculty = filterUsers("faculty");

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
  const bulkApprove = async () => {
    if (bulkApproveUsers) await bulkApproveUsers(selected);
    setSelected([]);
  };

  const bulkReject = async () => {
    if (bulkDeleteUsers) await bulkDeleteUsers(selected);
    setSelected([]);
  };

  const Card = ({ title, users, badgeColor, actions, children }) => (
    <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all hover:shadow-blue-500/10">
      <div className={`${darkMode ? "bg-black" : "bg-white"} rounded-[calc(1.5rem-1px)] overflow-hidden`}>
        <div className={`flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50/50"}`}>
          <h3 className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} text-xl flex items-center gap-3`}>
            {title}
            <span className={`text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${badgeColor}`}>
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
              <p className={`${darkMode ? "text-blue-100/30" : "text-gray-400"} font-bold italic`}>No pending requests in this category.</p>
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
        key="pending"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? "bg-black" : "bg-white"} p-8 rounded-[calc(2rem-2px)] relative overflow-hidden backdrop-blur-xl`}>
            <div className="relative flex-1 max-w-md p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
              <div className="relative h-full">
                <input
                  type="text"
                  placeholder="Search by name, email, ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-white text-black"} rounded-2xl outline-none transition-all font-medium`}
                />
                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-white/30" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <p className={`${darkMode ? "text-blue-300" : "text-blue-600"} text-sm font-black uppercase tracking-widest`}>
              Filtering {pendingUsers.length} total users
            </p>
          </div>
        </div>

        {pendingLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-100/40 font-black uppercase tracking-widest text-xs">Fetching requests...</p>
          </div>
        ) : (
          <>
            <Card
              title="🎓 Alumni Requests"
              users={alumni}
              badgeColor={darkMode ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-green-100 text-green-700 border border-green-200"}
              actions={
                alumni.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "alumni" })}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Approve ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "alumni" })}
                      className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-sm font-black border border-red-500/30 transition-all disabled:opacity-30"
                    >
                      Reject
                    </button>
                  </div>
                )
              }
            >
              <Table
                users={alumni}
                selected={selected}
                toggleUser={toggleUser}
                toggleSelectAll={toggleSelectAll}
                onApprove={(u) => setConfirm({ type: "approve", user: u })}
                onDelete={(u) => setConfirm({ type: "delete", user: u })}
              />
            </Card>

            <Card
              title="🏫 Faculty Requests"
              users={faculty}
              badgeColor={darkMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200"}
              actions={
                faculty.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "faculty" })}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Approve ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "faculty" })}
                      className="px-6 py-2.5 bg-white/5 hover:bg-red-500/20 text-red-300 rounded-2xl text-sm font-black border border-white/10 transition-all disabled:opacity-30"
                    >
                      Reject
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
                onApprove={(u) => setConfirm({ type: "approve", user: u })}
                onDelete={(u) => setConfirm({ type: "delete", user: u })}
                onPromote={promoteToAdmin}
              />
            </Card>
          </>
        )}
      </motion.div>

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
              className={`${darkMode ? "bg-gray-900 border-white/20" : "bg-white border-gray-200"} border rounded-[2rem] p-8 w-full max-w-md shadow-2xl`}
            >
              <h3 className="text-2xl font-black text-white mb-4">
                {confirm.type.includes("bulk")
                  ? confirm.type.includes("approve")
                    ? `Approve ${selected.length} users?`
                    : `Reject ${selected.length} users?`
                  : confirm.type === "approve"
                    ? "Approve User?"
                    : "Reject & Delete User?"}
              </h3>

              {confirm.user && (
                <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"} p-4 rounded-xl border mb-6`}>
                  <p className={`font-bold ${darkMode ? "text-white" : "text-slate-900"} text-lg`}>{confirm.user.name}</p>
                  <p className={`${darkMode ? "text-blue-100/60" : "text-slate-500"} text-sm truncate`}>{confirm.user.email}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 font-black">
                <button
                  onClick={() => setConfirm(null)}
                  className={`px-6 py-3 ${darkMode ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-gray-100 hover:bg-gray-200 text-slate-900 border-gray-200"} rounded-2xl border transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirm.type === "bulk-approve") await bulkApprove();
                    if (confirm.type === "bulk-delete") await bulkReject();
                    if (confirm.type === "approve") await approveUser(confirm.user._id);
                    if (confirm.type === "delete") await deleteUser(confirm.user._id);
                    setConfirm(null);
                  }}
                  className={`px-8 py-3 text-white rounded-2xl shadow-xl active:scale-95 transition-all ${confirm.type.includes("delete") ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
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
function Table({ users, selected, toggleUser, toggleSelectAll, onApprove, onDelete, onPromote }) {
  const { darkMode } = useTheme();
  if (users.length === 0) return null;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead>
          <tr className={`${darkMode ? "text-white border-white/10 bg-white/5" : "text-slate-900 border-gray-100 bg-gray-50"} text-[10px] uppercase font-black tracking-[0.2em] border-b`}>
            <th className="py-4 px-6 text-left">
              <input
                type="checkbox"
                className="w-5 h-5 bg-white/5 border-white/10 rounded cursor-pointer accent-blue-500"
                checked={users.every((u) => selected.includes(u._id))}
                onChange={() => toggleSelectAll(users)}
              />
            </th>
            <th className="py-4 px-6 text-left font-black">User Profile</th>
            <th className="py-4 px-6 text-left md:table-cell hidden font-black">Identification</th>
            <th className="py-4 px-6 text-right font-black">Actions</th>
          </tr>
        </thead>
        <tbody className={`${darkMode ? "divide-white/5" : "divide-gray-100"}`}>
          {users.map((u) => (
            <tr key={u._id} className={`group ${darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-all`}>
              <td className="py-5 px-6">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-white/5 border-white/10 rounded cursor-pointer accent-blue-500"
                  checked={selected.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                />
              </td>
              <td className="py-5 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300 font-black text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} truncate`}>{u.name}</p>
                    <p className={`text-xs ${darkMode ? "text-blue-100/40" : "text-slate-500"} truncate`}>{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-5 px-6 md:table-cell hidden">
                <span className={`text-xs font-black ${darkMode ? "text-blue-100/60 bg-white/5 border-white/5" : "text-slate-600 bg-gray-100 border-gray-200"} px-3 py-1.5 rounded-lg border whitespace-nowrap`}>
                  {u.enrollmentNumber || u.employeeId || "N/A"}
                </span>
              </td>
              <td className="py-5 px-6 text-right space-x-2">
                <button
                  onClick={() => onApprove(u)}
                  className="p-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                  title="Approve"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </button>
                <button
                  onClick={() => onDelete(u)}
                  className="p-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all active:scale-90"
                  title="Reject"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {onPromote && (
                  <button
                    onClick={() => onPromote(u._id)}
                    className="p-2.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl transition-all active:scale-90"
                    title="Make Admin"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
