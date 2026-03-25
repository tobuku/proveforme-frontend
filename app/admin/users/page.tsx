"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  city: string;
  state: string;
  serviceZipCodes: string | null;
  isVerified: boolean;
  stripeOnboarded: boolean;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const ROLES = ["INVESTOR", "BG", "ADMIN"] as const;

const roleBadge: Record<string, string> = {
  INVESTOR: "bg-blue-100 text-blue-700",
  BG: "bg-amber-100 text-amber-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  useEffect(() => { document.title = "Manage Users \u2014 ProveForMe"; }, []);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role !== "ADMIN") {
      router.replace("/login");
      return;
    }
    try {
      const raw = localStorage.getItem("pfm_user");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentAdminId(u.id || null);
      }
    } catch {}
  }, [router]);

  const fetchUsers = useCallback(() => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);

    fetch(`${API_BASE}/api/v1/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!data.ok) throw new Error("Response not ok");
        setUsers(data.users);
        setPagination(data.pagination);
      })
      .catch((err) => {
        console.error("Failed to fetch users", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role === "ADMIN") fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to change role");
        return;
      }
      setSuccess(data.message);
      fetchUsers();
    } catch (err) {
      console.error("Role change error", err);
      setError("Network error changing role");
    }
  }

  async function handleDelete(userId: string) {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to delete user");
        return;
      }
      setSuccess(data.message);
      setConfirmDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete error", err);
      setError("Network error deleting user");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AuthedHeader role="ADMIN" />

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Admin
            </p>
            <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          </div>
          <Link
            href="/admin"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-2 text-xs text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">Role</th>
                  <th className="px-3 py-2 text-left font-semibold">Zip Codes</th>
                  <th className="px-3 py-2 text-left font-semibold">Verified</th>
                  <th className="px-3 py-2 text-left font-semibold">Stripe</th>
                  <th className="px-3 py-2 text-left font-semibold">Joined</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-2">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadge[user.role] || "bg-gray-100 text-gray-700"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {user.serviceZipCodes
                        ? user.serviceZipCodes
                        : user.city && user.state
                          ? `${user.city}, ${user.state}`
                          : "—"}
                    </td>
                    <td className="px-3 py-2">{user.isVerified ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      {user.stripeOnboarded ? "Yes" : "No"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded border border-gray-300 px-1.5 py-1 text-[11px] outline-none"
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        {user.id !== currentAdminId && (
                          <>
                            {confirmDeleteId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="rounded border border-red-300 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="rounded border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(user.id)}
                                className="rounded border border-red-300 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs">
            <p className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
