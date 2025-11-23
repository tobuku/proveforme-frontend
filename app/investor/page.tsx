"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type Project = {
  id: string;
  title: string;
  description?: string;
  city: string;
  state: string;
  payPerVisit: string;
  createdAt: string;
};

type AuthUser = {
  id: string;
  email: string;
  role: "INVESTOR" | "BG";
  firstName?: string | null;
  lastName?: string | null;
};

export default function InvestorDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem("pfm_token");
      const rawUser = localStorage.getItem("pfm_user");

      if (!token || !rawUser) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(rawUser);
      setUser(parsed);
    } catch (e) {
      console.error("Failed to load auth info", e);
      setError("Failed to load auth info.");
      setLoading(false);
    }
  }, []);

  // Load investor projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem("pfm_token");
        if (!token) {
          setError("Missing auth token.");
          setLoading(false);
          return;
        }

        const url = `${API_BASE}/api/v1/investor/projects/my`;
        console.log("Fetching investor projects from:", url);

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error("Failed to parse projects response as JSON", jsonErr);
          setError("Projects endpoint returned a non JSON response.");
          setLoading(false);
          return;
        }

        console.log("Projects response:", res.status, data);

        if (!res.ok || !data.ok) {
          setError(
            data?.error ||
              `Failed to load projects (status ${res.status}).`
          );
          setLoading(false);
          return;
        }

        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setError(null);
      } catch (err) {
        console.error("Network error while loading projects", err);
        setError("Network error loading projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <AuthedHeader role={null} />
        <main className="mx-auto max-w-5xl p-8 text-sm">
          Loading dashboard…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <AuthedHeader role={user?.role ?? null} />
        <main className="mx-auto max-w-5xl p-8 text-sm">
          <h1 className="text-xl font-semibold mb-3">Investor Dashboard</h1>
          <p className="text-red-400 text-sm">Error: {error}</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <AuthedHeader role={null} />
        <main className="mx-auto max-w-5xl p-8 text-sm">
          <p>Not logged in.</p>
        </main>
      </div>
    );
  }

  if (user.role !== "INVESTOR") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <AuthedHeader role={user.role} />
        <main className="mx-auto max-w-5xl p-8 text-sm">
          <p className="text-red-400">
            Access denied. This dashboard is for investors only.
          </p>
        </main>
      </div>
    );
  }

  const displayName =
    (user.firstName || "").trim() +
    (user.lastName ? " " + (user.lastName || "").trim() : "");

  return (
    <div className="pfm-shell">
      <AuthedHeader role={user.role} />

      <main className="mx-auto max-w-5xl p-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Investor Dashboard
            </h1>
            <p className="text-xs text-slate-300">
              Welcome {displayName || user.email}
            </p>
          </div>

          <Link
            href="/investor/projects/create"
            className="rounded-md bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 border border-indigo-400"
          >
            + Create project
          </Link>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Your projects
          </h2>

          {projects.length === 0 ? (
            <p className="text-sm text-slate-400">
              You have no projects yet. Once you create a project, it will
              appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-md border border-slate-800 bg-slate-900/40 p-4 text-sm"
                >
                  <p className="font-semibold text-slate-50">
                    {p.title || "Untitled project"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.city}, {p.state}
                  </p>
                  <p className="text-xs mt-1 text-slate-300">
                    Pay per visit:{" "}
                    <span className="font-semibold">${p.payPerVisit}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Created: {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
