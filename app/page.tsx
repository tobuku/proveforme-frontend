"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthedHeader } from "../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type BackendHealth = {
  ok: boolean;
  message?: string;
} | null;

type Role = "INVESTOR" | "BG";

type AuthUser = {
  id: string;
  email: string;
  role: Role;
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
      const role = localStorage.getItem("pfm_role") as Role | null;
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

  const dashboardHref = authUser?.role === "BG" ? "/bg" : "/investor";

  const fullName =
    ((authUser?.firstName || "").trim() +
      " " +
      (authUser?.lastName || "").trim()).trim() || authUser?.email;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Global header with logo, nav, logout etc */}
      <AuthedHeader role={authUser?.role ?? null} />

      {/* MAIN */}
      <main className="mx-auto max-w-5xl flex-1 space-y-10 px-4 py-8">
        {/* HERO SECTION */}
        <section className="grid items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">
              Real estate · Remote oversight · On demand photos
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Connect investors with Boots on the Ground.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-700">
              ProveForMe allows remote investors to securely hire trusted local
              people to act as their boots on the ground and verify properties
              with timestamped photos, videos, and visit logs.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <Link
                href="/register"
                className="rounded-md bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-400"
              >
                Become a member
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-800 hover:border-slate-400 hover:text-slate-900"
              >
                Log in to dashboard
              </Link>
            </div>

            {/* AUTH BANNER */}
            <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              {authUser ? (
                <p>
                  You are logged in as{" "}
                  <span className="font-semibold">{fullName}</span>{" "}
                  {authUser.role === "INVESTOR" ? "(Investor)" : "(BG / Prover)"}.
                  <span className="ml-1">
                    Go to{" "}
                    <Link
                      href={dashboardHref}
                      className="underline underline-offset-2 hover:text-emerald-800"
                    >
                      your dashboard
                    </Link>
                    .
                  </span>
                </p>
              ) : (
                <p>
                  You are viewing the public homepage. Use{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-2 text-emerald-900 hover:text-emerald-800"
                  >
                    Log in
                  </Link>{" "}
                  to access investor or BG tools.
                </p>
              )}
            </div>
          </div>

          {/* MEMBER AREA EXPLANATION */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Member area
            </p>
            <p className="leading-relaxed">
              Your main investor and prover tools live inside the authenticated
              dashboards. From there you can manage projects and verify work
              without being physically present.
            </p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Create projects and set pay per visit.</li>
              <li>Approve or invite local BGs / Provers.</li>
              <li>Review visit photos, timestamps, and status updates.</li>
            </ul>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="grid gap-4 text-xs md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Verified work visits
            </p>
            <p>
              Each visit logs photos, timestamps, and a reviewable trail so you
              can see real progress without being on site.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Secure coordination
            </p>
            <p>
              Investors and Provers coordinate through a structured workflow,
              which helps protect everyone and reduces miscommunication.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Built to scale
            </p>
            <p>
              Start with a few properties in one market, then expand to more
              cities as your Prover network grows.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            ProveForMe · Commission based platform connecting remote investors
            with local "Boots on the Ground" (Provers). Demo environment only.
          </p>
          <p>
            Backend status:{" "}
            {backendError
              ? `error: ${backendError}`
              : backendHealth?.ok
              ? `ok: ${
                  backendHealth.message || "ProveForMe backend is alive"
                }`
              : "checking..."}
          </p>
        </div>
      </footer>
    </div>
  );
}
