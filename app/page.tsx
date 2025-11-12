"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  message: string;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  payPerVisit: string;
  status?: string;
  createdAt?: string;
};

type AuthedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "INVESTOR" | "BG";
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_BASE ||
  "http://localhost:4000";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [openProjects, setOpenProjects] = useState<Project[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [authUser, setAuthUser] = useState<AuthedUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Load backend health + open projects (even if we don't show them yet,
  // this keeps the wiring in place for future UX).
  useEffect(() => {
    // Health
    fetch(`${API_BASE}/api/v1/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Health failed (${res.status})`);
        const data = (await res.json()) as HealthResponse;
        setHealth(data);
      })
      .catch((err) => {
        console.error("Health check error:", err);
        setHealthError("Failed to contact backend.");
      });

    // Open projects
    setProjectsLoading(true);
    fetch(`${API_BASE}/api/v1/projects/open`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Open projects failed (${res.status})`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.projects)) {
          setOpenProjects(data.projects);
        } else {
          setProjectsError("Failed to load projects");
        }
      })
      .catch((err) => {
        console.error("Open projects error:", err);
        setProjectsError("Failed to load projects");
      })
      .finally(() => setProjectsLoading(false));
  }, []);

  // Load auth user from token via /auth/me
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("pfm_token");
    if (!token) {
      setAuthChecked(true);
      return;
    }

    fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`auth/me failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (data.ok && data.user) {
          setAuthUser(data.user as AuthedUser);
        }
      })
      .catch((err) => {
        console.error("auth/me error:", err);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const fullName = authUser
    ? `${authUser.firstName} ${authUser.lastName}`.trim()
    : "";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/40">
              <span className="text-sm font-bold text-emerald-300">PFM</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight md:text-base">
                ProveForMe
              </h1>
              <p className="hidden text-[10px] text-slate-400 sm:block">
                Local eyes for remote investors.
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-xs">
            <a
              href="/"
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800/70"
            >
              Home
            </a>
            <a
              href="/login"
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800/70"
            >
              Log in
            </a>
            <a
              href="/register"
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800/70"
            >
              Register
            </a>
            <a
              href="/bg"
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800/70"
            >
              Member Dashboard
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* HERO / MARKETING BLOCK */}
        <section className="max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
            Real estate · Remote oversight · On-demand photos
          </p>

          <h2 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            Connect{" "}
            <span className="text-emerald-400">Investors</span> with{" "}
            <span className="text-emerald-400">Boots on the Ground</span>.
          </h2>

          <p className="max-w-xl text-sm text-slate-300">
            ProveForMe allows remote investors to securely hire trusted local
            people to act as their boots on the ground.
          </p>

          {/* Auth-aware CTA strip */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            {authChecked && authUser ? (
              <div className="space-y-2">
                <p className="text-xs text-emerald-300">
                  You&apos;re logged in as{" "}
                  <span className="font-semibold">
                    {fullName || authUser.email}
                  </span>{" "}
                  ({authUser.role === "INVESTOR" ? "Investor" : "BG / Prover"}).
                </p>

                {authUser.role === "INVESTOR" ? (
                  <div className="flex flex-wrap gap-3 text-xs">
                    <a
                      href="/"
                      className="rounded-lg bg-emerald-500 px-3 py-2 font-medium text-slate-950 hover:bg-emerald-400"
                    >
                      Go to investor dashboard
                    </a>
                    <a
                      href="/bg"
                      className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800/70"
                    >
                      View Member Dashboard
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 text-xs">
                    <a
                      href="/bg"
                      className="rounded-lg bg-emerald-500 px-3 py-2 font-medium text-slate-950 hover:bg-emerald-400"
                    >
                      Go to Member Dashboard
                    </a>
                    <a
                      href="/"
                      className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800/70"
                    >
                      Back to home
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Get started by choosing how you use ProveForMe:
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a
                    href="/register?role=investor"
                    className="rounded-lg bg-emerald-500 px-3 py-2 font-medium text-slate-950 hover:bg-emerald-400"
                  >
                    I&apos;m an Investor
                  </a>
                  <a
                    href="/register?role=bg"
                    className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800/70"
                  >
                    I&apos;m a Prover
                  </a>
                  <a
                    href="/login"
                    className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800/70"
                  >
                    I already have an account
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Three small feature bullets */}
          <div className="grid gap-4 text-[11px] text-slate-300 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                Verified work visits
              </p>
              <p className="text-slate-400">
                Each visit logs photos, timestamps, and a trail the investor can
                review.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">
                No phone numbers exposed
              </p>
              <p className="text-slate-400">
                Investors and Provers coordinate through our secure platform
                ensuring safety and fairness for all members.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-100">Nationwide-ready</p>
              <p className="text-slate-400">
                Currently expanding from Texas, into multiple markets as our
                network of Provers increases.
              </p>
            </div>
          </div>
        </section>

        {/* Auth-aware small dashboard summary area */}
        {authChecked && authUser && (
          <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-200">Member area</p>

            {authUser.role === "INVESTOR" ? (
              <p className="text-[11px] text-slate-300">
                You&apos;re viewing the public homepage. Your main investor
                tools live here and in the Member Dashboard as we continue
                polishing, but you can already manage projects, assign BGs, and
                review visits from this app.
              </p>
            ) : (
              <p className="text-[11px] text-slate-300">
                As a BG / Prover, your main workspace is the{" "}
                <a
                  href="/bg"
                  className="text-emerald-300 underline-offset-2 hover:underline"
                >
                  Member Dashboard
                </a>
                . That&apos;s where you&apos;ll see assigned projects, create
                visit logs, and upload photos.
              </p>
            )}
          </section>
        )}

        <footer className="mt-6 border-t border-slate-900 pt-4 text-[10px] text-slate-500">
          <p>
            ProveForMe · Commission-based platform connecting remote investors
            with local &quot;Boots on the Ground&quot; (Provers). All names and
            example projects in this environment are test data.
          </p>
          {health && (
            <p className="mt-1 text-[10px] text-slate-600">
              Backend status: {health.status} — {health.message}
            </p>
          )}
          {healthError && !health && (
            <p className="mt-1 text-[10px] text-red-500">
              Backend status check: {healthError}
            </p>
          )}
        </footer>
      </div>
    </main>
  );
}
