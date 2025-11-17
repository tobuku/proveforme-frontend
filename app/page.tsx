"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type BackendHealth = {
  ok: boolean;
  message?: string;
} | null;

type AuthUser = {
  id: string;
  email: string;
  role: "INVESTOR" | "BG";
  firstName?: string | null;
  lastName?: string | null;
};

export default function Home() {
  const [backendHealth, setBackendHealth] = useState<BackendHealth>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Backend health check
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Health failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setBackendHealth(data);
        setBackendError(null);
      })
      .catch((err) => {
        console.error("Backend health error", err);
        setBackendError("Failed to contact backend.");
      });
  }, []);

  // Read auth from localStorage (set by /login)
  useEffect(() => {
    try {
      const token = localStorage.getItem("pfm_token");
      const role = localStorage.getItem("pfm_role") as
        | "INVESTOR"
        | "BG"
        | null;
      const rawUser = localStorage.getItem("pfm_user");

      if (token && role && rawUser) {
        const user = JSON.parse(rawUser) as AuthUser;
        setAuthUser({ ...user, role });
      } else {
        setAuthUser(null);
      }
    } catch (err) {
      console.error("Failed to read auth from storage", err);
      setAuthUser(null);
    }
  }, []);

  // IMPORTANT: Investor -> /investor, BG -> /bg
  const dashboardHref =
    authUser?.role === "BG" ? "/bg" : "/investor";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* HEADER / NAV */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500 px-2 py-1 text-xs font-semibold tracking-wide">
              PFM
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">ProveForMe</p>
              <p className="text-[10px] text-slate-400">
                Local eyes for remote investors.
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-slate-300 hover:text-white">
              Home
            </Link>
            <Link href="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link href="/register" className="text-slate-300 hover:text-white">
              Register
            </Link>
            <Link
              href={dashboardHref}
              className="rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-400"
            >
              Member Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        {/* HERO */}
        <section className="grid items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
              Real estate · Remote oversight · On-demand photos
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Connect Investors with Boots on the Ground.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              ProveForMe allows remote investors to securely hire trusted local
              people to act as their boots on the ground.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <Link
                href="/register"
                className="rounded-md bg-indigo-500 px-3 py-2 font-semibold hover:bg-indigo-400"
              >
                Become a member
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-slate-700 px-3 py-2 font-medium text-slate-100 hover:border-slate-500"
              >
                Log in to dashboard
              </Link>
              {authUser && (
                <Link
                  href={dashboardHref}
                  className="rounded-md border border-emerald-600 px-3 py-2 font-semibold text-emerald-100 hover:border-emerald-400"
                >
                  {authUser.role === "INVESTOR"
                    ? "Go to investor dashboard"
                    : "Go to BG dashboard"}
                </Link>
              )}
            </div>

            {/* AUTH BANNER */}
            <div className="mt-4 rounded-md border border-emerald-700/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
              {authUser ? (
                <p>
                  You&apos;re logged in as{" "}
                  <span className="font-semibold">
                    {(authUser.firstName || "").trim()}{" "}
                    {(authUser.lastName || "").trim()}
                  </span>{" "}
                  (
                  {authUser.role === "INVESTOR"
                    ? "Investor"
                    : "BG / Prover"}
                  ).{" "}
                  <span className="ml-1">
                    View your{" "}
                    <Link
                      href={dashboardHref}
                      className="underline underline-offset-2 hover:text-emerald-200"
                    >
                      member dashboard
                    </Link>
                    .
                  </span>
                </p>
              ) : (
                <p>
                  You&apos;re viewing the public homepage. Use{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-2 hover:text-emerald-200"
                  >
                    Log in
                  </Link>{" "}
                  to access investor or BG tools.
                </p>
              )}
            </div>
          </div>

          {/* MEMBER AREA EXPLANATION */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Member area
            </p>
            <p className="leading-relaxed text-slate-300">
              You&apos;re viewing the public homepage. Your main investor tools
              live in the Member Dashboard and related authenticated screens as
              we keep polishing, but the core flows are already live.
            </p>
            <ul className="space-y-1 list-disc pl-4 text-slate-300">
              <li>Create projects and set pay-per-visit.</li>
              <li>Approve or invite local BGs / Provers.</li>
              <li>Review visit photos, timestamps, and status updates.</li>
            </ul>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid gap-4 text-xs md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Verified work visits
            </p>
            <p className="text-slate-300">
              Each visit logs photos, timestamps, and a trail you can review
              later, so you can see real progress without being on-site.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Secure coordination
            </p>
            <p className="text-slate-300">
              Investors and Provers coordinate through our secure platform
              ensuring safety and fairness for all members.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Nationwide-ready
            </p>
            <p className="text-slate-300">
              Currently expanding from Texas into multiple markets as our
              network of Provers increases.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4 text-[11px] text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            ProveForMe · Commission-based platform connecting remote investors
            with local &quot;Boots on the Ground&quot; (Provers). All names and
            example projects in this environment are test data.
          </p>
          <p>
            Backend status:{" "}
            {backendError
              ? `error — ${backendError}`
              : backendHealth?.ok
              ? `ok — ${
                  backendHealth.message || "ProveForMe backend is alive"
                }`
              : "checking..."}
          </p>
        </div>
      </footer>
    </div>
  );
}
