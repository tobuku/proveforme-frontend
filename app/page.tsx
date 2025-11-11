"use client";

import { useEffect, useState } from "react";

type UserRole = "INVESTOR" | "BG";

type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string;
};

type HealthResponse = {
  status: string;
  message: string;
};

type OpenProject = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  payPerVisit: string;
  createdAt: string;
};

type InvestorProject = {
  id: string;
  investorId: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  fullAddress: string | null;
  payPerVisit: string;
  commissionRate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  primaryBGId: string | null;
  secondaryBGId: string | null;
};

type VisitForInvestor = {
  id: string;
  projectId: string;
  bgId: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  bg: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

type OpenProjectsResponse = {
  ok: boolean;
  projects: OpenProject[];
};

type InvestorProjectsResponse = {
  ok: boolean;
  projects: InvestorProject[];
};

type ProjectVisitsResponse = {
  ok: boolean;
  visits: VisitForInvestor[];
};

type CreateProjectFormState = {
  title: string;
  city: string;
  state: string;
  fullAddress: string;
  description: string;
  payPerVisit: string;
};

const BACKEND_BASE = "http://localhost:4000";
const FRONTEND_BASE = "http://localhost:3000";

export default function Home() {
  // Health + open projects
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [openProjects, setOpenProjects] = useState<OpenProject[]>([]);
  const [openProjectsError, setOpenProjectsError] = useState<string | null>(null);

  // Auth
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Investor projects
  const [investorProjects, setInvestorProjects] = useState<InvestorProject[] | null>(null);
  const [investorProjectsLoading, setInvestorProjectsLoading] = useState(false);
  const [investorProjectsError, setInvestorProjectsError] = useState<string | null>(null);

  // Visits per project (for investor)
  const [projectVisits, setProjectVisits] = useState<Record<string, VisitForInvestor[]>>({});
  const [projectVisitsLoading, setProjectVisitsLoading] = useState<Record<string, boolean>>({});
  const [projectVisitsError, setProjectVisitsError] = useState<Record<string, string | null>>({});

  // Per-visit status update state
  const [visitStatusUpdating, setVisitStatusUpdating] = useState<Record<string, boolean>>({});

  // Create-project form
  const [createProjectForm, setCreateProjectForm] = useState<CreateProjectFormState>({
    title: "",
    city: "",
    state: "",
    fullAddress: "",
    description: "",
    payPerVisit: "",
  });
  const [createProjectSubmitting, setCreateProjectSubmitting] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);
  const [createProjectSuccess, setCreateProjectSuccess] = useState<string | null>(null);

  // --- Initial effects: health, open projects, auth info ---
  useEffect(() => {
    // Health
    fetch(`${BACKEND_BASE}/api/v1/health`)
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setHealth(data);
        setHealthError(null);
      })
      .catch((err) => {
        console.error("Health check error:", err);
        setHealthError("Failed to contact backend.");
      });

    // Open projects
    fetch(`${BACKEND_BASE}/api/v1/projects/open`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Open projects failed (${res.status}): ${text || "Unknown error"}`);
        }
        return res.json();
      })
      .then((data: OpenProjectsResponse) => {
        if (!data.ok) throw new Error("Backend reported error loading open projects");
        setOpenProjects(data.projects);
        setOpenProjectsError(null);
      })
      .catch((err) => {
        console.error("Open projects error:", err);
        setOpenProjectsError(err.message || "Failed to load open projects.");
      });

    // Auth info from localStorage
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("pfm_token");
        const userJson = localStorage.getItem("pfm_user");
        if (token && userJson) {
          const user = JSON.parse(userJson) as AuthUser;
          setAuthUser(user);
          setAuthToken(token);
        }
      } catch (err) {
        console.error("Failed to read auth from localStorage:", err);
      }
    }
  }, []);

  // Whenever we know we have an INVESTOR, load investor projects
  useEffect(() => {
    if (!authUser || !authToken) return;
    const roleUpper = (authUser.role || "").toString().toUpperCase();
    if (roleUpper === "INVESTOR") {
      loadInvestorProjects(authToken);
    }
  }, [authUser, authToken]);

  async function loadInvestorProjects(token: string) {
    try {
      setInvestorProjectsLoading(true);
      setInvestorProjectsError(null);

      const res = await fetch(`${BACKEND_BASE}/api/v1/investor/projects/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load investor projects (${res.status}): ${text || "Unknown error"}`
        );
      }

      const data = (await res.json()) as InvestorProjectsResponse;
      if (!data.ok) {
        throw new Error("Backend reported error loading investor projects");
      }

      setInvestorProjects(data.projects);
    } catch (err: any) {
      console.error("loadInvestorProjects error:", err);
      setInvestorProjectsError(err.message || "Failed to load investor projects.");
    } finally {
      setInvestorProjectsLoading(false);
    }
  }

  async function loadProjectVisits(projectId: string) {
    if (!authUser) {
      alert("Not logged in as an investor.");
      return;
    }
    const roleUpper = (authUser.role || "").toString().toUpperCase();
    if (roleUpper !== "INVESTOR") {
      alert(`Only investors can view project visits. You are ${roleUpper}.`);
      return;
    }

    try {
      setProjectVisitsLoading((prev) => ({ ...prev, [projectId]: true }));
      setProjectVisitsError((prev) => ({ ...prev, [projectId]: null }));

      const url = `${BACKEND_BASE}/api/v1/projects/${projectId}/visits?investorEmail=${encodeURIComponent(
        authUser.email
      )}`;

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load project visits (${res.status}): ${text || "Unknown error"}`
        );
      }

      const data = (await res.json()) as ProjectVisitsResponse;
      if (!data.ok) {
        throw new Error("Backend reported error loading project visits");
      }

      setProjectVisits((prev) => ({
        ...prev,
        [projectId]: data.visits,
      }));
    } catch (err: any) {
      console.error("loadProjectVisits error:", err);
      setProjectVisitsError((prev) => ({
        ...prev,
        [projectId]: err.message || "Failed to load project visits.",
      }));
    } finally {
      setProjectVisitsLoading((prev) => ({ ...prev, [projectId]: false }));
    }
  }

  async function updateVisitStatus(
    projectId: string,
    visitId: string,
    newStatus: "APPROVED" | "DISPUTED" | "PAID"
  ) {
    if (!authUser) {
      alert("Not logged in as an investor.");
      return;
    }
    const roleUpper = (authUser.role || "").toString().toUpperCase();
    if (roleUpper !== "INVESTOR") {
      alert(`Only investors can update visit status. You are ${roleUpper}.`);
      return;
    }

    const key = `${projectId}:${visitId}`;

    try {
      setVisitStatusUpdating((prev) => ({ ...prev, [key]: true }));

      const res = await fetch(`${BACKEND_BASE}/api/v1/visits/${visitId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investorEmail: authUser.email,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to update visit status (${res.status}): ${text || "Unknown error"}`
        );
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error("Backend reported error updating visit status");
      }

      // Update UI immediately
      setProjectVisits((prev) => {
        const existing = prev[projectId] || [];
        const updated = existing.map((v) =>
          v.id === visitId ? { ...v, status: newStatus } : v
        );
        return {
          ...prev,
          [projectId]: updated,
        };
      });
    } catch (err: any) {
      console.error("updateVisitStatus error:", err);
      alert(err.message || "Failed to update visit status.");
    } finally {
      setVisitStatusUpdating((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleCreateProjectSubmit(e: any) {
    e.preventDefault();
    setCreateProjectError(null);
    setCreateProjectSuccess(null);

    if (!authUser || !authToken) {
      setCreateProjectError("You must be logged in as an investor to create a project.");
      return;
    }
    const roleUpper = (authUser.role || "").toString().toUpperCase();
    if (roleUpper !== "INVESTOR") {
      setCreateProjectError(`Only investors can create projects. You are ${roleUpper}.`);
      return;
    }

    if (!createProjectForm.title || !createProjectForm.city || !createProjectForm.state) {
      setCreateProjectError("Title, city, and state are required.");
      return;
    }
    if (!createProjectForm.payPerVisit) {
      setCreateProjectError("Pay per visit is required.");
      return;
    }

    try {
      setCreateProjectSubmitting(true);

      const res = await fetch(`${BACKEND_BASE}/api/v1/investor/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: createProjectForm.title,
          city: createProjectForm.city,
          state: createProjectForm.state,
          fullAddress: createProjectForm.fullAddress || null,
          description: createProjectForm.description || "",
          payPerVisit: createProjectForm.payPerVisit,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Create project failed (${res.status}): ${text || "Unknown error"}`
        );
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error("Backend reported error creating project");
      }

      setCreateProjectSuccess("Project created successfully.");
      setCreateProjectForm({
        title: "",
        city: "",
        state: "",
        fullAddress: "",
        description: "",
        payPerVisit: "",
      });

      // Refresh investor projects
      if (authToken) {
        await loadInvestorProjects(authToken);
      }
    } catch (err: any) {
      console.error("Create project error:", err);
      setCreateProjectError(err.message || "Failed to create project.");
    } finally {
      setCreateProjectSubmitting(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pfm_token");
      localStorage.removeItem("pfm_user");
    }
    setAuthUser(null);
    setAuthToken(null);
    setInvestorProjects(null);
    setProjectVisits({});
    setProjectVisitsError({});
    setProjectVisitsLoading({});
    setVisitStatusUpdating({});
  }

  const roleUpper = (authUser?.role || "").toString().toUpperCase();

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-6xl w-full px-4 py-6 md:px-8 md:py-10 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">ProveForMe Dashboard</h1>
            <p className="text-xs text-slate-300">
              Frontend at{" "}
              <span className="font-mono text-emerald-300">{FRONTEND_BASE}</span> talking to
              backend at{" "}
              <span className="font-mono text-emerald-300">{BACKEND_BASE}</span>.
            </p>
          </div>
          <div className="text-[11px] text-slate-200 flex flex-col items-end gap-1">
            {authUser ? (
              <>
                <p>
                  Logged in as{" "}
                    <span className="font-semibold">
                      {authUser.firstName} {authUser.lastName}
                    </span>{" "}
                  (
                  <span className="font-mono">{roleUpper}</span>)
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
                Not logged in. Use{" "}
                <span className="font-mono bg-slate-800 px-1 rounded">/login</span> to
                authenticate.
              </p>
            )}
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {/* LEFT: Health + Open projects */}
          <div className="space-y-4">
            <section className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Backend Health
              </h2>
              {health && !healthError && (
                <div className="text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="text-emerald-300">{health.status}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Message:</span>{" "}
                    <span className="text-slate-200">{health.message}</span>
                  </p>
                </div>
              )}
              {healthError && (
                <p className="text-xs text-red-400">Error: {healthError}</p>
              )}
            </section>

            <section className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Open Projects
              </h2>
              {openProjectsError && (
                <p className="text-xs text-red-400">Error: {openProjectsError}</p>
              )}
              {!openProjectsError && openProjects.length === 0 && (
                <p className="text-xs text-slate-400">
                  No open projects currently visible.
                </p>
              )}
              <div className="space-y-2 max-h-[18rem] overflow-y-auto pr-1 text-xs">
                {openProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 space-y-1"
                  >
                    <p className="text-[13px] font-semibold text-slate-100">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-slate-200">
                      {p.city}, {p.state}
                    </p>
                    <p className="text-[11px] text-slate-200 mt-1">
                      <span className="font-semibold">Pay per visit:</span> $
                      {p.payPerVisit}
                    </p>
                    {p.description && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {p.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Created: {new Date(p.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 break-all">
                      Project ID: {p.id}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: My Dashboard (auth-based) */}
          <div className="space-y-4">
            <section className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
              <h2 className="text-sm font-semibold text-slate-100">
                My Dashboard (auth-based)
              </h2>

              {!authUser && (
                <p className="text-xs text-slate-400">
                  You&apos;re not logged in. Go to{" "}
                  <span className="font-mono bg-slate-900 px-1 rounded">
                    /login
                  </span>{" "}
                  and sign in as either an Investor or BG.
                </p>
              )}

              {authUser && roleUpper === "BG" && (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    You are logged in as{" "}
                    <span className="font-semibold">BG (Boots on the Ground)</span>.
                  </p>
                  <p>
                    Your main workspace is the{" "}
                    <a
                      href="/bg"
                      className="text-emerald-300 underline hover:text-emerald-200"
                    >
                      /bg
                    </a>{" "}
                    dashboard. There you can see all your assigned visits and
                    manage photos.
                  </p>
                </div>
              )}

              {authUser && roleUpper === "INVESTOR" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-300">
                      You are logged in as{" "}
                      <span className="font-semibold">Investor</span>.
                    </p>
                  </div>

                  {/* Create project form */}
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700 space-y-2">
                    <p className="font-semibold text-slate-200 text-[12px]">
                      Create a new project
                    </p>
                    <form
                      onSubmit={handleCreateProjectSubmit}
                      className="space-y-2 text-[11px]"
                    >
                      <div>
                        <label className="block mb-1 text-slate-300">
                          Title
                        </label>
                        <input
                          className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px]"
                          value={createProjectForm.title}
                          onChange={(e) =>
                            setCreateProjectForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block mb-1 text-slate-300">
                            City
                          </label>
                          <input
                            className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px]"
                            value={createProjectForm.city}
                            onChange={(e) =>
                              setCreateProjectForm((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="w-20">
                          <label className="block mb-1 text-slate-300">
                            State
                          </label>
                          <input
                            className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px]"
                            value={createProjectForm.state}
                            onChange={(e) =>
                              setCreateProjectForm((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-300">
                          Full address (optional)
                        </label>
                        <input
                          className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px]"
                          value={createProjectForm.fullAddress}
                          onChange={(e) =>
                            setCreateProjectForm((prev) => ({
                              ...prev,
                              fullAddress: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-300">
                          Description (optional)
                        </label>
                        <textarea
                          className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px] min-h-[50px]"
                          value={createProjectForm.description}
                          onChange={(e) =>
                            setCreateProjectForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-300">
                          Pay per visit (USD)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[11px]"
                          value={createProjectForm.payPerVisit}
                          onChange={(e) =>
                            setCreateProjectForm((prev) => ({
                              ...prev,
                              payPerVisit: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      {createProjectError && (
                        <p className="text-[11px] text-red-400">
                          {createProjectError}
                        </p>
                      )}
                      {createProjectSuccess && (
                        <p className="text-[11px] text-emerald-300">
                          {createProjectSuccess}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={createProjectSubmitting}
                        className="mt-1 px-3 py-1 rounded bg-emerald-500 text-slate-900 font-semibold text-[11px] hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {createProjectSubmitting ? "Creating…" : "Create project"}
                      </button>
                    </form>
                  </div>

                  {/* Investor projects + visits */}
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-200 text-[12px]">
                        My projects
                      </p>
                      <button
                        type="button"
                        onClick={() => authToken && loadInvestorProjects(authToken)}
                        className="px-2 py-1 rounded border border-slate-600 bg-slate-800 text-[11px] hover:bg-slate-700"
                      >
                        Refresh
                      </button>
                    </div>

                    {investorProjectsLoading && (
                      <p className="text-[11px] text-slate-400">
                        Loading your projects…
                      </p>
                    )}

                    {investorProjectsError && (
                      <p className="text-[11px] text-red-400">
                        {investorProjectsError}
                      </p>
                    )}

                    {!investorProjectsLoading &&
                      !investorProjectsError &&
                      investorProjects &&
                      investorProjects.length === 0 && (
                        <p className="text-[11px] text-slate-400">
                          You don&apos;t have any projects yet.
                        </p>
                      )}

                    {!investorProjectsLoading &&
                      !investorProjectsError &&
                      investorProjects &&
                      investorProjects.length > 0 && (
                        <div className="space-y-2 max-h-[18rem] overflow-y-auto pr-1">
                          {investorProjects.map((proj) => {
                            const visitsForProj = projectVisits[proj.id] || [];
                            const visitsLoading = projectVisitsLoading[proj.id];
                            const visitsErr = projectVisitsError[proj.id];

                            return (
                              <div
                                key={proj.id}
                                className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-2 text-[11px]"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[13px] font-semibold text-slate-100">
                                      {proj.title}
                                    </p>
                                    <p className="text-[11px] text-slate-200">
                                      {proj.city}, {proj.state}
                                    </p>
                                    {proj.fullAddress && (
                                      <p className="text-[11px] text-slate-300 mt-1">
                                        {proj.fullAddress}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-[10px] text-slate-300 space-y-1">
                                    <p>
                                      <span className="font-semibold">Status:</span>{" "}
                                      {proj.status}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Pay per visit:</span>{" "}
                                      ${proj.payPerVisit}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Commission:</span>{" "}
                                      {Number(proj.commissionRate) * 100}%
                                    </p>
                                  </div>
                                </div>

                                <p className="text-[10px] text-slate-500">
                                  Created:{" "}
                                  {new Date(proj.createdAt).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-500 break-all">
                                  Project ID: {proj.id}
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => loadProjectVisits(proj.id)}
                                    disabled={visitsLoading}
                                    className="px-2 py-1 rounded border border-slate-600 bg-slate-900 text-[11px] hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {visitsLoading
                                      ? "Loading visits…"
                                      : "Load visits"}
                                  </button>
                                </div>

                                {visitsErr && (
                                  <p className="text-[11px] text-red-400 mt-1">
                                    {visitsErr}
                                  </p>
                                )}

                                {visitsForProj.length > 0 && (
                                  <div className="mt-2 space-y-2 border-t border-slate-700 pt-2">
                                    {visitsForProj.map((v) => {
                                      const key = `${proj.id}:${v.id}`;
                                      const isUpdating = !!visitStatusUpdating[key];

                                      return (
                                        <div
                                          key={v.id}
                                          className="p-2 rounded bg-slate-900 border border-slate-700 space-y-1"
                                        >
                                          <p className="text-[11px] text-slate-200">
                                            <span className="font-semibold">
                                              Status:
                                            </span>{" "}
                                            {v.status}
                                          </p>
                                          {v.bg && (
                                            <p className="text-[11px] text-slate-200">
                                              <span className="font-semibold">
                                                BG:
                                              </span>{" "}
                                              {v.bg.firstName} {v.bg.lastName} (
                                              <span className="font-mono">
                                                {v.bg.email}
                                              </span>
                                              )
                                            </p>
                                          )}
                                          {v.notes && (
                                            <p className="text-[11px] text-slate-300">
                                              <span className="font-semibold">
                                                Notes:
                                              </span>{" "}
                                              {v.notes}
                                            </p>
                                          )}
                                          <p className="text-[10px] text-slate-500">
                                            Scheduled:{" "}
                                            {new Date(
                                              v.scheduledAt
                                            ).toLocaleString()}
                                          </p>
                                          <p className="text-[10px] text-slate-500">
                                            Created:{" "}
                                            {new Date(
                                              v.createdAt
                                            ).toLocaleString()}
                                          </p>
                                          <p className="text-[10px] text-slate-500 break-all">
                                            Visit ID: {v.id}
                                          </p>

                                          <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateVisitStatus(
                                                  proj.id,
                                                  v.id,
                                                  "APPROVED"
                                                )
                                              }
                                              disabled={isUpdating}
                                              className="px-2 py-1 rounded bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                              {isUpdating &&
                                              v.status === "APPROVED"
                                                ? "Updating…"
                                                : "Approve"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateVisitStatus(
                                                  proj.id,
                                                  v.id,
                                                  "DISPUTED"
                                                )
                                              }
                                              disabled={isUpdating}
                                              className="px-2 py-1 rounded bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                              {isUpdating &&
                                              v.status === "DISPUTED"
                                                ? "Updating…"
                                                : "Dispute"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateVisitStatus(
                                                  proj.id,
                                                  v.id,
                                                  "PAID"
                                                )
                                              }
                                              disabled={isUpdating}
                                              className="px-2 py-1 rounded bg-sky-500 text-slate-900 font-semibold hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                              {isUpdating &&
                                              v.status === "PAID"
                                                ? "Updating…"
                                                : "Mark as paid"}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Tiny dev-helper note at the bottom */}
        <footer className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
          <p>
            Investor tools live here on the home dashboard. BG tools live at{" "}
            <span className="font-mono bg-slate-800 px-1 rounded">/bg</span>. Photos
            are handled on{" "}
            <span className="font-mono bg-slate-800 px-1 rounded">
              /upload-test
            </span>{" "}
            per visit.
          </p>
        </footer>
      </div>
    </main>
  );
}
