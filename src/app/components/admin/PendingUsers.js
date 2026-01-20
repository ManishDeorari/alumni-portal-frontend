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
    <div className="bg-white rounded-xl border shadow-sm mb-8">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
            {users.length}
          </span>
        </h3>
        {actions}
      </div>
      {users.length === 0 ? (
        <p className="p-5 text-sm text-gray-500">No pending requests.</p>
      ) : (
        children
      )}
    </div>
  );

  return (
    <>
      <motion.div
        key="pending"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 text-gray-900 p-6 rounded-xl shadow-md"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
          <input
            type="text"
            placeholder="Search by name, email, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {pendingLoading ? (
          <p>Loading pending users...</p>
        ) : (
          <>
            <Card
              title="🎓 Alumni Requests"
              users={alumni}
              badgeColor="bg-green-100 text-green-700"
              actions={
                alumni.length > 0 && (
                  <div className="flex gap-2 mb-2 px-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "alumni" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-green-600 to-green-500 text-white rounded disabled:opacity-50"
                    >
                      Approve Selected
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "alumni" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded disabled:opacity-50"
                    >
                      Reject Selected
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
              badgeColor="bg-indigo-100 text-indigo-700"
              actions={
                faculty.length > 0 && (
                  <div className="flex gap-2 mb-2 px-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "faculty" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded disabled:opacity-50"
                    >
                      Approve Selected
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "faculty" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded disabled:opacity-50"
                    >
                      Reject Selected
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
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">
                {confirm.type.includes("bulk")
                  ? confirm.type.includes("approve")
                    ? `Approve selected ${confirm.role} users?`
                    : `Reject selected ${confirm.role} users?`
                  : confirm.type === "approve"
                  ? "Approve User?"
                  : "Reject & Delete User?"}
              </h3>

              {confirm.user && (
                <p className="text-sm text-gray-600 mb-4">
                  {confirm.user.name} ({confirm.user.email})
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-4 py-1.5 border rounded"
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
                  className={`px-4 py-1.5 text-white rounded ${
                    confirm.type.includes("delete") ? "bg-red-600" : "bg-green-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- TABLE ---------------- */
function Table({ users, selected, toggleUser, toggleSelectAll, onApprove, onDelete, onPromote }) {
  if (users.length === 0) return <p className="p-5 text-sm text-gray-500">No users.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                checked={users.every((u) => selected.includes(u._id))}
                onChange={() => toggleSelectAll(users)}
              />
            </th>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                />
              </td>
              <td className="p-3">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </td>
              <td className="p-3 text-gray-600">{u.enrollmentNumber || u.employeeId}</td>
              <td className="p-3 space-x-2">
                <button onClick={() => onApprove(u)} className="px-3 py-1 bg-green-600 text-white rounded">
                  Approve
                </button>
                <button onClick={() => onDelete(u)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Reject
                </button>
                {onPromote && (
                  <button onClick={() => onPromote(u._id)} className="px-3 py-1 bg-blue-600 text-white rounded">
                    Make Admin
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
