"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "INVESTOR" | "BG";
  city: string | null;
  state: string | null;
  stripeOnboarded?: boolean;
  serviceZipCodes?: string[];
};

type PaymentSummary = {
  totalEarnings: number;
  pendingPayments: number;
  fundedPayments: number;
  releasedPayments: number;
};

type ProjectSummary = {
  totalProjects: number;
  openProjects: number;
  fundedProjects: number;
  totalSpent: number;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For BGs - payment/earnings summary
  const [bgPayments, setBgPayments] = useState<PaymentSummary | null>(null);

  // For Investors - project summary
  const [investorSummary, setInvestorSummary] = useState<ProjectSummary | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("pfm_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Fetch user profile
        const res = await fetch(`${API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          setError("Failed to load profile");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.ok && data.user) {
          setUser(data.user);

          // Load role-specific data
          if (data.user.role === "BG") {
            loadBGPayments(token);
          } else if (data.user.role === "INVESTOR") {
            loadInvestorSummary(token);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Network error loading profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function loadBGPayments(token: string) {
    try {
      // Fetch payments where this user is the BG
      const res = await fetch(`${API_BASE}/api/v1/payments/my-earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBgPayments(data);
      }
    } catch (err) {
      console.error("Error loading BG payments:", err);
    }
  }

  async function loadInvestorSummary(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const projects = data.projects || [];

        // Calculate summary
        const openProjects = projects.filter((p: any) => p.status === "OPEN").length;
        const fundedProjects = projects.filter((p: any) => p.fundedCount > 0 || p.releasedCount > 0).length;
        const totalSpent = projects.reduce((sum: number, p: any) => sum + (p.totalPaid || 0), 0);

        setInvestorSummary({
          totalProjects: projects.length,
          openProjects,
          fundedProjects,
          totalSpent,
        });
      }
    } catch (err) {
      console.error("Error loading investor summary:", err);
    }
  }

  if (loading) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role={null} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-gray-600">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role={null} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-red-600">{error || "Failed to load profile"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pfm-shell">
      <AuthedHeader role={user.role} />

      <main className="mx-auto max-w-3xl px-4 py-8 text-sm">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            My Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black">
            {user.firstName} {user.lastName}
          </h1>
        </div>

        {/* Profile Info Card */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-black">Profile Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Email</p>
              <p className="mt-1 text-sm text-black">{user.email}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Account Type</p>
              <p className="mt-1 text-sm text-black">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {user.role === "INVESTOR" ? "Investor" : "Boots on the Ground (BG)"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">First Name</p>
              <p className="mt-1 text-sm text-black">{user.firstName || "—"}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Last Name</p>
              <p className="mt-1 text-sm text-black">{user.lastName || "—"}</p>
            </div>

            {(user.city || user.state) && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Location</p>
                <p className="mt-1 text-sm text-black">
                  {[user.city, user.state].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* BG-specific: Payment Setup & Earnings */}
        {user.role === "BG" && (
          <>
            <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-black">Payment Setup</h2>
              <div className="flex items-center gap-3">
                {user.stripeOnboarded ? (
                  <>
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                    <p className="text-sm text-green-700">Payment account connected and ready</p>
                  </>
                ) : (
                  <>
                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
                    <p className="text-sm text-yellow-700">Payment setup incomplete</p>
                  </>
                )}
              </div>
            </section>

            <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-black">Service Areas</h2>
              {user.serviceZipCodes && user.serviceZipCodes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.serviceZipCodes.map((zip) => (
                    <span
                      key={zip}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {zip}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No service areas configured yet.</p>
              )}
              <p className="mt-3 text-[10px] text-gray-400">
                Manage your service zip codes from the BG Dashboard.
              </p>
            </section>

            {bgPayments && (
              <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-black">Earnings Summary</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">
                      ${bgPayments.totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-green-600">Total Earned</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{bgPayments.fundedPayments}</p>
                    <p className="text-[10px] uppercase tracking-wider text-blue-600">In Escrow</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-700">{bgPayments.releasedPayments}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Completed</p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Investor-specific: Project Summary */}
        {user.role === "INVESTOR" && investorSummary && (
          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-black">Project Summary</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-700">{investorSummary.totalProjects}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">Total Projects</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{investorSummary.openProjects}</p>
                <p className="text-[10px] uppercase tracking-wider text-blue-600">Open</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{investorSummary.fundedProjects}</p>
                <p className="text-[10px] uppercase tracking-wider text-green-600">Funded</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">
                  ${investorSummary.totalSpent.toFixed(2)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-purple-600">Total Spent</p>
              </div>
            </div>
          </section>
        )}

        {/* Account ID (for support) */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Account ID</p>
          <p className="mt-1 font-mono text-[11px] text-gray-600">{user.id}</p>
        </section>
      </main>
    </div>
  );
}
