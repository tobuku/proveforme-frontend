"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AdminProject = {
  id: string;
  title: string;
  city: string;
  state: string;
  payPerVisit: number;
  status: string;
  createdAt: string;
  investor: { id: string; firstName: string; lastName: string; email: string };
  primaryBG: { id: string; firstName: string; lastName: string } | null;
  _count: { visits: number; payments: number; bgInterests: number };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;

const statusBadge: Record<string, string> = {
  OPEN: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = "Manage Projects \u2014 ProveForMe"; }, []);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role !== "ADMIN") {
      router.replace("/login");
    }
  }, [router]);

  const fetchProjects = useCallback(() => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_BASE}/api/v1/admin/projects?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!data.ok) throw new Error("Response not ok");
        setProjects(data.projects);
        setPagination(data.pagination);
      })
      .catch((err) => {
        console.error("Failed to fetch projects", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role === "ADMIN") fetchProjects();
  }, [fetchProjects]);

  async function handleStatusChange(projectId: string, newStatus: string) {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/projects/${projectId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to change status");
        return;
      }
      setSuccess(data.message);
      fetchProjects();
    } catch (err) {
      console.error("Status change error", err);
      setError("Network error changing status");
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
            <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
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
            placeholder="Search title or location..."
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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
                  <th className="px-3 py-2 text-left font-semibold">Title</th>
                  <th className="px-3 py-2 text-left font-semibold">Location</th>
                  <th className="px-3 py-2 text-left font-semibold">Investor</th>
                  <th className="px-3 py-2 text-left font-semibold">BG</th>
                  <th className="px-3 py-2 text-left font-semibold">Pay/Visit</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Visits</th>
                  <th className="px-3 py-2 text-left font-semibold">Payments</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">
                      {project.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {project.city}, {project.state}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {project.investor.firstName} {project.investor.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {project.primaryBG
                        ? `${project.primaryBG.firstName} ${project.primaryBG.lastName}`
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      ${Number(project.payPerVisit).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[project.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{project._count.visits}</td>
                    <td className="px-3 py-2">{project._count.payments}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <select
                        className="rounded border border-gray-300 px-1.5 py-1 text-[11px] outline-none"
                        value={project.status}
                        onChange={(e) =>
                          handleStatusChange(project.id, e.target.value)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                      No projects found.
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
