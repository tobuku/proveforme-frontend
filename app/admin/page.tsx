"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type RoleCount = { role: string; count: number };
type StatusCount = { status: string; count: number };

type StatsData = {
  users: RoleCount[];
  projects: StatusCount[];
  payments: StatusCount[];
  visits: StatusCount[];
  financial: {
    totalPayments: number;
    totalVolume: number;
    totalPlatformRevenue: number;
    totalPaidToBGs: number;
  };
};

const statusColors: Record<string, string> = {
  // Roles
  INVESTOR: "bg-blue-100 text-blue-700",
  BG: "bg-amber-100 text-amber-700",
  ADMIN: "bg-purple-100 text-purple-700",
  // Project statuses
  OPEN: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
  // Payment statuses
  PENDING: "bg-yellow-100 text-yellow-700",
  FUNDED: "bg-blue-100 text-blue-700",
  HELD: "bg-orange-100 text-orange-700",
  RELEASED: "bg-green-100 text-green-700",
  REFUNDED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
  // Visit statuses
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  DISPUTED: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

function fmt(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function total(arr: { count: number }[]) {
  return arr.reduce((s, r) => s + r.count, 0);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("pfm_role");
    if (role !== "ADMIN") {
      router.replace("/login");
      return;
    }

    const token = localStorage.getItem("pfm_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Stats request failed (${res.status})`);
        const data = await res.json();
        if (!data.ok) throw new Error("Stats response not ok");
        setStats(data);
      })
      .catch((err) => {
        console.error("Failed to fetch admin stats", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AuthedHeader role="ADMIN" />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Admin
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-slate-500">Loading stats...</p>
        ) : stats ? (
          <>
            {/* Totals */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Total Users
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {total(stats.users)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Total Projects
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {total(stats.projects)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Total Payments
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.financial.totalPayments}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Total Visits
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {total(stats.visits)}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Financial Summary
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Total Volume</p>
                  <p className="text-lg font-semibold">
                    {fmt(stats.financial.totalVolume)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Platform Revenue</p>
                  <p className="text-lg font-semibold text-green-700">
                    {fmt(stats.financial.totalPlatformRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paid to BGs</p>
                  <p className="text-lg font-semibold">
                    {fmt(stats.financial.totalPaidToBGs)}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdowns */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BreakdownCard title="Users by Role" data={stats.users} labelKey="role" />
              <BreakdownCard title="Projects by Status" data={stats.projects} labelKey="status" />
              <BreakdownCard title="Payments by Status" data={stats.payments} labelKey="status" />
              <BreakdownCard title="Visits by Status" data={stats.visits} labelKey="status" />
            </div>

            {/* Navigation Links */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/admin/users", label: "Manage Users", desc: "Search, filter, change roles, delete" },
                { href: "/admin/projects", label: "Manage Projects", desc: "Search, filter, override status" },
                { href: "/admin/payments", label: "Manage Payments", desc: "Filter, override status, cleanup" },
                { href: "/admin/visits", label: "View Visits", desc: "Filter and view all visits" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{link.desc}</p>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  labelKey,
}: {
  title: string;
  data: { count: number; [key: string]: unknown }[];
  labelKey: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <div className="space-y-1.5">
        {data.map((row) => {
          const label = String(row[labelKey]);
          return (
            <div key={label} className="flex items-center justify-between text-xs">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[label] || "bg-gray-100 text-gray-700"}`}
              >
                {label}
              </span>
              <span className="font-semibold">{row.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
