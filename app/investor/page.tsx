"use client";

import { useEffect, useState } from "react";

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
        setError("Not logged in");
        return;
      }

      const parsed = JSON.parse(rawUser);
      setUser(parsed);
    } catch {
      setError("Failed to load auth info");
    }
  }, []);

  // Load investor projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem("pfm_token");
        if (!token) {
          setError("Missing auth token");
          return;
        }

        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!data.ok) {
          setError(data.error || "Failed to load projects");
          return;
        }

        setProjects(data.projects);
      } catch (err) {
        setError("Network error loading projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (error) {
    return (
      <div className="p-8 text-red-400 text-sm">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (loading || !user) {
    return <div className="p-8 text-sm">Loading dashboard...</div>;
  }

  if (user.role !== "INVESTOR") {
    return (
      <div className="p-8 text-sm text-red-400">
        Access denied. This dashboard is for investors only.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 text-slate-50">
      <h1 className="text-2xl font-bold">Investor Dashboard</h1>
      <p className="text-sm text-slate-300">
        Welcome {user.firstName} {user.lastName}
      </p>

      <h2 className="text-xl mt-6 font-semibold">Your Projects</h2>

      {projects.length === 0 ? (
        <p className="text-sm text-slate-400">You have no projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-slate-800 p-4 bg-slate-900/40"
            >
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-slate-400">
                {p.city}, {p.state}
              </p>
              <p className="text-xs mt-1">
                Pay per visit: <strong>${p.payPerVisit}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Created: {new Date(p.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
