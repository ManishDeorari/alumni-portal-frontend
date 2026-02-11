"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PendingUsers({
  pendingUsers,
  pendingLoading,
  approveUser,
  deleteUser,
  promoteToAdmin,
}) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState([]);

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
    for (const id of selected) await approveUser(id);
    setSelected([]);
  };

  const bulkReject = async () => {
    for (const id of selected) await deleteUser(id);
    setSelected([]);
  };

  const Card = ({ title, users, badgeColor, actions, children }) => (
    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl mb-10 overflow-hidden group transition-all hover:border-white/20">
      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
        <h3 className="font-extrabold text-white text-xl flex items-center gap-3">
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
            <p className="text-blue-100/30 font-bold italic">No pending requests in this category.</p>
          </div>
        ) : (
          children
        )}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-white/20 font-medium"
            />
            <svg className="absolute left-4 top-4 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-blue-100/40 text-sm font-bold uppercase tracking-widest">
            Filtering {pendingUsers.length} total users
          </p>
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
              badgeColor="bg-green-500/20 text-green-300 border border-green-500/30"
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
                      className="px-6 py-2.5 bg-white/5 hover:bg-red-500/20 text-red-300 rounded-2xl text-sm font-black border border-white/10 transition-all disabled:opacity-30"
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
              badgeColor="bg-purple-500/20 text-purple-300 border border-purple-500/30"
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
              className="bg-gray-900 border border-white/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
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
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <p className="font-bold text-white text-lg">{confirm.user.name}</p>
                  <p className="text-blue-100/60 text-sm truncate">{confirm.user.email}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 font-black">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
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
  if (users.length === 0) return null;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead>
          <tr className="text-blue-100/30 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
            <th className="py-4 px-6 text-left">
              <input
                type="checkbox"
                className="w-5 h-5 bg-white/5 border-white/10 rounded cursor-pointer accent-blue-500"
                checked={users.every((u) => selected.includes(u._id))}
                onChange={() => toggleSelectAll(users)}
              />
            </th>
            <th className="py-4 px-6 text-left">User Profile</th>
            <th className="py-4 px-6 text-left md:table-cell hidden">Identification</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((u) => (
            <tr key={u._id} className="group hover:bg-white/5 transition-all">
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
                    <p className="font-extrabold text-white truncate">{u.name}</p>
                    <p className="text-xs text-blue-100/40 truncate">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-5 px-6 md:table-cell hidden">
                <span className="text-xs font-black text-blue-100/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 whitespace-nowrap">
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
