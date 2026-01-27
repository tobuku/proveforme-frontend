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

type AssignedBG = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Project = {
  id: string;
  investorId?: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  fullAddress?: string | null;
  payPerVisit: string;
  status?: string | null;
  createdAt?: string;
  // Enhanced fields from updated API
  assignedBG?: AssignedBG | null;
  fundedCount?: number;
  releasedCount?: number;
  totalPaid?: number;
  interestedBGCount?: number;
};

type LegacyProjectsEnvelope = {
  ok: boolean;
  projects?: any[];
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

  // Load projects and filter to this investor
  useEffect(() => {
    async function loadProjects() {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("pfm_token");
      if (!token) {
        setLoading(false);
        setError("Missing auth token. Please log in again.");
        return;
      }

      // Try to read current investor id from storage
      let currentInvestorId: string | null = null;
      try {
        const rawUser = localStorage.getItem("pfm_user");
        if (rawUser) {
          const user = JSON.parse(rawUser) as AuthUser;
          currentInvestorId = user.id;
        }
      } catch (err) {
        console.error("Failed to read investor id from storage", err);
      }

      try {
        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setError(`Failed to load projects (status ${res.status}).`);
          setLoading(false);
          return;
        }

        let raw: unknown;
        try {
          raw = await res.json();
        } catch (jsonErr) {
          console.error("Failed to parse projects response", jsonErr);
          setError("Failed to load projects (invalid JSON from server).");
          setLoading(false);
          return;
        }

        // Normalize backend shapes:
        // 1) Current backend: plain array of projects
        // 2) Legacy: { ok, projects }
        let rawProjects: any[] | null = null;

        if (Array.isArray(raw)) {
          rawProjects = raw;
        } else {
          const env = raw as LegacyProjectsEnvelope;
          if (env && typeof env === "object") {
            if (env.error && !env.ok) {
              setError(env.error);
              setLoading(false);
              return;
            }
            if (env.ok && Array.isArray(env.projects)) {
              rawProjects = env.projects;
            }
          }
        }

        if (!rawProjects) {
          console.error("Unexpected projects payload:", raw);
          setError("Failed to load projects (unexpected response shape).");
          setLoading(false);
          return;
        }

        const mapped: Project[] = rawProjects.map((p: any) => ({
          id: String(p.id),
          investorId:
            p.investorId === undefined || p.investorId === null
              ? undefined
              : String(p.investorId),
          title: String(p.title ?? ""),
          description:
            p.description === null || p.description === undefined
              ? null
              : String(p.description),
          city: String(p.city ?? ""),
          state: String(p.state ?? ""),
          fullAddress:
            p.fullAddress === null || p.fullAddress === undefined
              ? null
              : String(p.fullAddress),
          payPerVisit: String(p.payPerVisit ?? ""),
          status:
            p.status === undefined || p.status === null
              ? null
              : String(p.status),
          createdAt:
            p.createdAt === undefined || p.createdAt === null
              ? undefined
              : String(p.createdAt),
          // Enhanced fields
          assignedBG: p.assignedBG || null,
          fundedCount: p.fundedCount || 0,
          releasedCount: p.releasedCount || 0,
          totalPaid: p.totalPaid || 0,
          interestedBGCount: p.interestedBGCount || 0,
        }));

        // Frontend safety filter so each investor only sees their own projects
        let filtered = mapped;
        if (currentInvestorId) {
          filtered = mapped.filter(
            (p) => !p.investorId || p.investorId === currentInvestorId
          );
        }

        setProjects(filtered);
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

  // Compute project status for display
  function getProjectDisplayStatus(project: Project) {
    if ((project.releasedCount || 0) > 0) {
      return { label: "Completed", color: "bg-green-100 text-green-700 border-green-200" };
    }
    if ((project.fundedCount || 0) > 0) {
      return { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if ((project.interestedBGCount || 0) > 0) {
      return { label: "BGs Interested", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
    return { label: "Open", color: "bg-gray-100 text-gray-600 border-gray-200" };
  }

  return (
    <div className="pfm-shell">
      <AuthedHeader role={authUser?.role ?? "INVESTOR"} />

      <main className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Investor Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black">
              Welcome {firstName} {lastName}
            </h1>
            <p className="mt-1 text-xs text-gray-600">
              Create projects, assign Boots on the Ground, and review visit
              activity from one place.
            </p>
          </div>

          <Link
            href="/investor/projects/create"
            className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            <span>+ Create project</span>
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-black">
            Your projects
          </h2>

          {loading && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              Loading projects...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600">
              You have no projects yet. Once you create a project, it will
              appear here.
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => {
                const displayStatus = getProjectDisplayStatus(project);
                const hasBG = project.assignedBG !== null;

                return (
                  <Link
                    href={`/investor/projects/${project.id}`}
                    key={project.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                            {project.city}, {project.state}
                          </p>
                          <h3 className="text-sm font-semibold text-black">
                            {project.title}
                          </h3>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${displayStatus.color}`}>
                          {displayStatus.label}
                        </span>
                      </div>

                      {project.fullAddress && (
                        <p className="text-[11px] font-medium text-gray-700">
                          {project.fullAddress}
                        </p>
                      )}

                      {project.description && (
                        <p className="text-[11px] text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Assigned BG Info */}
                      {hasBG && project.assignedBG && (
                        <div className="rounded-md bg-blue-50 px-3 py-2 border border-blue-100">
                          <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">
                            Assigned BG
                          </p>
                          <p className="text-[11px] text-blue-800 font-semibold">
                            {project.assignedBG.firstName} {project.assignedBG.lastName}
                          </p>
                          <p className="text-[10px] text-blue-600">
                            {project.assignedBG.email}
                          </p>
                        </div>
                      )}

                      {/* Interested BGs count (if no assignment yet) */}
                      {!hasBG && (project.interestedBGCount || 0) > 0 && (
                        <div className="rounded-md bg-yellow-50 px-3 py-2 border border-yellow-100">
                          <p className="text-[11px] text-yellow-800">
                            <span className="font-semibold">{project.interestedBGCount}</span> BG{project.interestedBGCount === 1 ? "" : "s"} interested
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                      <div className="flex items-center gap-3">
                        <span>
                          <span className="font-semibold text-black">${project.payPerVisit}</span>/visit
                        </span>
                        {(project.totalPaid || 0) > 0 && (
                          <span className="text-green-600">
                            ${project.totalPaid?.toFixed(2)} paid
                          </span>
                        )}
                      </div>
                      <span className="text-black font-medium">
                        {hasBG ? "View Details" : "Fund BG"} &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
