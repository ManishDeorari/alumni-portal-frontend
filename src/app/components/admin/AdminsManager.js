"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminsManager({
  adminsList,
  adminsLoading,
  promoteToAdmin,
  demoteAdmin,
  deleteUser,
}) {
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
    <div className="bg-white rounded-xl border shadow-sm mb-8">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          <span className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>
            {users.length}
          </span>
        </h3>
        {actions}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <motion.div
        key="admins"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
       className="bg-white/90 text-gray-900 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          Manage Admins & Faculty
        </h2>

        <input
          type="text"
          placeholder="Search by name, email, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 mb-6 px-3 py-2 border rounded-md text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {adminsLoading ? (
          <p>Loading users...</p>
        ) : (
          <>
            {/* 🛡️ ADMINS */}
            <Card
              title="🛡️ Admins"
              users={admins}
              badge="bg-indigo-100 text-indigo-700"
              actions={
                admins.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-demote" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded disabled:opacity-50"
                    >
                      Demote Selected
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-delete" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded disabled:opacity-50"
                    >
                      Delete Selected
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
              badge="bg-green-100 text-green-700"
              actions={
                faculty.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-promote" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded disabled:opacity-50"
                    >
                      Promote Selected
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ action: "bulk-delete" })}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded disabled:opacity-50"
                    >
                      Delete Selected
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
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="font-semibold mb-4">
                {confirm.action.replace("bulk-", "").toUpperCase()}?
              </h3>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1.5 text-white rounded bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={async () => {
                    if (confirm.action === "bulk-promote") await bulkPromote();
                    if (confirm.action === "bulk-demote") await bulkDemote();
                    if (confirm.action === "bulk-delete") await bulkDelete();

                    if (confirm.action === "promote")
                      await promoteToAdmin(confirm.user._id);
                    if (confirm.action === "demote")
                      await demoteAdmin(confirm.user._id);
                    if (confirm.action === "delete")
                      await deleteUser(confirm.user._id);

                    setConfirm(null);
                  }}
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
  return users.length === 0 ? (
    <p className="p-5 text-sm text-gray-500">No users.</p>
  ) : (
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
                  disabled={u.isMainAdmin}
                />
              </td>

              <td className="p-3">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </td>

              <td className="p-3">{u.employeeId || u.enrollmentNumber || "—"}</td>

              <td className="p-3 space-x-2">
                {onPromote && (
                  <button
                    onClick={() => onPromote(u)}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded"
                  >
                    Promote
                  </button>
                )}

                {onDemote && !u.isMainAdmin && (
                  <button
                    onClick={() => onDemote(u)}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded"
                  >
                    Demote
                  </button>
                )}

                {u.isMainAdmin && (
                  <span className="px-3 py-1 bg-gray-300 text-xs rounded">
                    Main Admin
                  </span>
                )}

                <button
                  onClick={() => onDelete(u)}
                  className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
