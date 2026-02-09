"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AdminVisit = {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  photoCount: number;
  bg: { id: string; firstName: string; lastName: string; email: string };
  project: { id: string; title: string; city: string; state: string };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUSES = ["PENDING", "SUBMITTED", "APPROVED", "DISPUTED", "PAID"] as const;

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  DISPUTED: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export default function AdminVisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<AdminVisit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = "View Visits \u2014 ProveForMe"; }, []);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role !== "ADMIN") {
      router.replace("/login");
    }
  }, [router]);

  const fetchVisits = useCallback(() => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_BASE}/api/v1/admin/visits?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!data.ok) throw new Error("Response not ok");
        setVisits(data.visits);
        setPagination(data.pagination);
      })
      .catch((err) => {
        console.error("Failed to fetch visits", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role === "ADMIN") fetchVisits();
  }, [fetchVisits]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AuthedHeader role="ADMIN" />

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Admin
            </p>
            <h1 className="text-xl font-semibold tracking-tight">Visits</h1>
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
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
                  <th className="px-3 py-2 text-left font-semibold">Project</th>
                  <th className="px-3 py-2 text-left font-semibold">Location</th>
                  <th className="px-3 py-2 text-left font-semibold">BG</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Photos</th>
                  <th className="px-3 py-2 text-left font-semibold">Scheduled</th>
                  <th className="px-3 py-2 text-left font-semibold">Notes</th>
                  <th className="px-3 py-2 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">
                      {visit.project.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {visit.project.city}, {visit.project.state}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {visit.bg.firstName} {visit.bg.lastName}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[visit.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {visit.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{visit.photoCount}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(visit.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2" title={visit.notes || ""}>
                      {visit.notes || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(visit.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                      No visits found.
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
