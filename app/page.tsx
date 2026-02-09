"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthedHeader } from "../components/AuthedHeader";

type Role = "INVESTOR" | "BG" | "ADMIN";

type AuthUser = {
  id: string;
  email: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
};

export default function Home() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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

  const dashboardHref =
    authUser?.role === "ADMIN"
      ? "/admin"
      : authUser?.role === "BG"
        ? "/bg"
        : "/investor";

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
              Boots on the Ground for Investors.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-700">
              ProveForMe lets remote investors hire trusted local boots on the
              ground to verify property progress and reduce risk with clear,
              reliable proof from the field.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <Link
                href="/register"
                className="rounded-md bg-[#0066FF] px-3 py-2 font-semibold text-white hover:bg-[#0052CC]"
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
                  {authUser.role === "INVESTOR"
                    ? "(Investor)"
                    : authUser.role === "ADMIN"
                      ? "(Admin)"
                      : "(BG)"}.
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

          {/* VALUE PROPOSITION */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Why ProveForMe
            </p>
            <p className="leading-relaxed">
              ProveForMe gives investors real visibility into their properties
              by placing trusted local boots on the ground exactly where they
              need them. You stay informed, stay in control, and make well
              informed decisions with confidence.
            </p>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="grid gap-4 text-xs md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Verified work visits
            </p>
            <p>
              Each visit provides clear, time based proof of progress so you
              know what is happening on site without being there.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Secure coordination
            </p>
            <p>
              Investors and BGs coordinate through a structured workflow,
              which helps protect everyone and reduces miscommunication.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Built to scale
            </p>
            <p>
              Start with a few properties in one market, then expand to more
              cities as your network grows.
            </p>
          </div>
        </section>

        {/* SALES COPY SECTION */}
        <section className="prose prose-sm prose-slate max-w-none space-y-4 text-sm leading-relaxed text-slate-700">
          <p>
            ProveForMe gives real estate investors reliable visibility across active property projects without travel or delays.
          </p>
          <p>
            Manage projects through a secure dashboard built to help you monitor progress, coordinate activity, and make confident investment decisions from anywhere.
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Why Investors Use ProveForMe
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintain clear oversight across renovation and development projects</li>
            <li>Reduce risk caused by poor communication and delayed updates</li>
            <li>Track milestones and project performance inside one structured workspace</li>
            <li>Expand into new markets while maintaining control across your portfolio</li>
          </ul>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Built for Modern Real Estate Investors
          </p>
          <p>
            ProveForMe supports investors managing multiple properties across multiple markets. Each project stays organized, documented, and accessible in one secure platform designed to support better decisions and stronger investment outcomes.
          </p>
          <p className="font-semibold">
            Invest with clarity. Manage with confidence. Grow without losing oversight.
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <Link href="/about" className="hover:text-indigo-600">
                About Us
              </Link>
              <Link href="/support" className="hover:text-indigo-600">
                Support
              </Link>
              <Link href="/terms" className="hover:text-indigo-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-indigo-600">
                Privacy Policy
              </Link>
              <Link href="/sitemap-page" className="hover:text-indigo-600">
                Sitemap
              </Link>
            </div>
            <p className="text-[11px] text-slate-500">
              &copy; 2025 ProveForMe.com. All rights reserved. Owned and operated by Know Leap Strategies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
