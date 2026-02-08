"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AdminPayment = {
  id: string;
  amountTotal: number;
  platformFee: number;
  amountToBG: number;
  status: string;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  createdAt: string;
  investor: { id: string; firstName: string; lastName: string; email: string };
  bg: { id: string; firstName: string; lastName: string; email: string };
  project: { id: string; title: string };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUSES = [
  "PENDING",
  "FUNDED",
  "HELD",
  "RELEASED",
  "REFUNDED",
  "FAILED",
] as const;

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  FUNDED: "bg-blue-100 text-blue-700",
  HELD: "bg-orange-100 text-orange-700",
  RELEASED: "bg-green-100 text-green-700",
  REFUNDED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role !== "ADMIN") {
      router.replace("/login");
    }
  }, [router]);

  const fetchPayments = useCallback(() => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_BASE}/api/v1/admin/payments?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!data.ok) throw new Error("Response not ok");
        setPayments(data.payments);
        setPagination(data.pagination);
      })
      .catch((err) => {
        console.error("Failed to fetch payments", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role === "ADMIN") fetchPayments();
  }, [fetchPayments]);

  async function handleStatusChange(paymentId: string, newStatus: string) {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/payments/${paymentId}/status`,
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
      fetchPayments();
    } catch (err) {
      console.error("Status change error", err);
      setError("Network error changing status");
    }
  }

  async function handleCleanup() {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setError(null);
    setSuccess(null);
    setCleanupLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/cleanup-pending-payments`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to cleanup payments");
        return;
      }
      setSuccess(data.message);
      setConfirmCleanup(false);
      fetchPayments();
    } catch (err) {
      console.error("Cleanup error", err);
      setError("Network error during cleanup");
    } finally {
      setCleanupLoading(false);
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
            <h1 className="text-xl font-semibold tracking-tight">Payments</h1>
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

        {/* Filters + Cleanup */}
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

          {confirmCleanup ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCleanup}
                disabled={cleanupLoading}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cleanupLoading ? "Cleaning..." : "Confirm Cleanup"}
              </button>
              <button
                onClick={() => setConfirmCleanup(false)}
                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCleanup(true)}
              className="rounded-md border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Cleanup Pending Payments
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold">Fee</th>
                  <th className="px-3 py-2 text-left font-semibold">BG Payout</th>
                  <th className="px-3 py-2 text-left font-semibold">Project</th>
                  <th className="px-3 py-2 text-left font-semibold">Investor</th>
                  <th className="px-3 py-2 text-left font-semibold">BG</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">
                      ${payment.amountTotal.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      ${payment.platformFee.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      ${payment.amountToBG.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.project.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.investor.firstName} {payment.investor.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.bg.firstName} {payment.bg.lastName}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[payment.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <select
                        className="rounded border border-gray-300 px-1.5 py-1 text-[11px] outline-none"
                        value={payment.status}
                        onChange={(e) =>
                          handleStatusChange(payment.id, e.target.value)
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
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                      No payments found.
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
