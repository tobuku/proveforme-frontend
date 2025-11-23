"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: "INVESTOR" | "BG";
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  payPerVisit: string;
  status?: string | null;
  createdAt?: string;
};

type ProjectsResponse = {
  ok: boolean;
  projects?: Project[];
  error?: string;
};

export default function InvestorDashboardPage() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read auth from localStorage and guard route
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("pfm_token");
      const rawUser = localStorage.getItem("pfm_user");

      if (!token || !rawUser) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(rawUser) as AuthUser;
      if (parsed.role !== "INVESTOR") {
        router.replace("/login");
        return;
      }

      setAuthUser(parsed);
    } catch (err) {
      console.error("Error reading auth in investor dashboard", err);
      router.replace("/login");
    }
  }, [router]);

  // Load projects for this investor
  useEffect(() => {
    async function loadProjects() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("pfm_token");
      if (!token) {
        setLoading(false);
        setError("Missing auth token. Please log in again.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data: ProjectsResponse;
        try {
          data = (await res.json()) as ProjectsResponse;
        } catch (jsonErr) {
          console.error("Failed to parse projects response", jsonErr);
          setError("Failed to load projects (invalid server response).");
          setLoading(false);
          return;
        }

        if (!res.ok || !data.ok || !data.projects) {
          const message =
            data.error ||
            `Failed to load projects (status ${res.status}).`;
          setError(message);
          setLoading(false);
          return;
        }

        setProjects(data.projects);
        setError(null);
      } catch (err) {
        console.error("Network error loading projects", err);
        setError("Network error loading projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const firstName = (authUser?.firstName || "").trim() || "Investor";
  const lastName = (authUser?.lastName || "").trim() || "";

  return (
    <div className="pfm-shell">
      <AuthedHeader role={authUser?.role ?? "INVESTOR"} />

      <main className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
              Investor Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome {firstName} {lastName}
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Create projects, assign Boots on the Ground, and review visit
              activity from one place.
            </p>
          </div>

          <Link
            href="/investor/projects/create"
            className="inline-flex items-center gap-1 rounded-md bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
          >
            <span>+ Create project</span>
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Your projects
          </h2>

          {loading && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
              Loading projects...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
              You have no projects yet. Once you create a project, it will
              appear here.
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-300">
                      {project.city}, {project.state}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span>
                      Pay per visit:{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        ${project.payPerVisit}
                      </span>
                    </span>
                    {project.status && (
                      <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:border-slate-600 dark:text-slate-200">
                        {project.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
