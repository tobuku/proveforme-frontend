"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type UserRole = "INVESTOR" | "BG";

type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string;
};

type VisitForBg = {
  id: string;
  projectId: string;
  bgId: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    city: string;
    state: string;
  };
};

type BgVisitsResponse = {
  ok: boolean;
  visits: VisitForBg[];
};

export default function BgDashboardPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [visits, setVisits] = useState<VisitForBg[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("pfm_token");
    const userJson = localStorage.getItem("pfm_user");

    if (!token || !userJson) {
      setError("Not logged in. Please log in as a BG user first.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userJson) as AuthUser;
      setAuthUser(user);
      setAuthToken(token);

      const roleUpper = (user.role || "").toString().toUpperCase();
      if (roleUpper !== "BG") {
        setError(
          `This page is for Boots on the Ground (BG) users only. You are logged in as ${roleUpper}.`
        );
        setLoading(false);
        return;
      }

      // Fetch BG's own visits
      fetchBgVisits(token);
    } catch {
      setError("Failed to read login info. Try logging in again.");
      setLoading(false);
    }
  }, []);

  async function fetchBgVisits(token: string) {
    try {
      setLoading(true);
      setError(null);
      setVisits(null);

      const res = await fetch(`${API_BASE}/api/v1/visits/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load visits (${res.status}): ${
            text || "Unknown error"
          }`
        );
      }

      const data = (await res.json()) as BgVisitsResponse;
      if (!data.ok) {
        throw new Error("Backend reported an error loading visits.");
      }

      setVisits(data.visits);
    } catch (err: any) {
      setError(err.message || "Failed to load visits.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pfm_token");
      localStorage.removeItem("pfm_user");
      localStorage.removeItem("pfm_role");
    }
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="p-6 md:p-8 rounded-2xl shadow-xl bg-slate-800 max-w-4xl w-full space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">BG Dashboard</h1>
            <p className="text-xs text-slate-300">
              Boots on the Ground view of your own assigned visits.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px]">
            {authUser ? (
              <>
                <p className="text-slate-200">
                  Logged in as{" "}
                  <span className="font-semibold">
                    {authUser.firstName} {authUser.lastName}
                  </span>{" "}
                  (
                  <span className="font-mono">
                    {(authUser.role || "").toString().toUpperCase()}
                  </span>
                  )
                </p>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded border border-slate-500 bg-slate-700 text-[11px] hover:bg-slate-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <p className="text-slate-400">
                Not logged in yet. Use{" "}
                <span className="font-mono">/login</span> to authenticate.
              </p>
            )}
          </div>
        </header>

        <section className="p-4 rounded-xl bg-slate-900/70 border border-slate-700 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">My Visits</h2>

          {loading && (
            <p className="text-xs text-slate-400">Loading your visits…</p>
          )}

          {error && (
            <div className="p-3 rounded bg-red-700/70 text-xs">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {!loading && !error && visits && visits.length === 0 && (
            <p className="text-xs text-slate-400">
              You don&apos;t have any visits yet.
            </p>
          )}

          {!loading && !error && visits && visits.length > 0 && (
            <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1 text-xs">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1"
                >
                  <p className="text-[11px] text-slate-200">
                    <span className="font-semibold">Status:</span> {v.status}
                  </p>
                  <p className="text-[11px] text-slate-200">
                    <span className="font-semibold">Project:</span>{" "}
                    {v.project.title} ({v.project.city}, {v.project.state})
                  </p>
                  {v.notes && (
                    <p className="text-[11px] text-slate-300 mt-1">
                      <span className="font-semibold">Notes:</span> {v.notes}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    Scheduled: {new Date(v.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Created: {new Date(v.createdAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 break-all">
                    Visit ID: {v.id}
                  </p>
                  <a
                    href={`/upload-test?visitId=${encodeURIComponent(v.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-[11px] text-emerald-300 hover:text-emerald-200 underline"
                  >
                    Upload / view photos for this visit
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
