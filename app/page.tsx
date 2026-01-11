"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthedHeader } from "../components/AuthedHeader";

type Role = "INVESTOR" | "BG";

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
                  {authUser.role === "INVESTOR" ? "(Investor)" : "(BG)"}.
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
            ProveForMe.com exists for one reason. You invest capital into property. You need clear proof of what is happening on site. You need reliable verification without travel, delays, or guesswork. ProveForMe delivers that visibility in a secure, structured, and consistent way.
          </p>
          <p>
            Real estate moves fast. Capital leaves your account in minutes. Construction takes weeks. Decisions depend on timing. When you do not see what is happening, risk rises. Contractors miss deadlines. Budgets drift. Small issues turn into expensive problems. ProveForMe closes that gap. You gain direct visibility into each stage of your investment. You act based on evidence instead of assumptions.
          </p>
          <p>
            The platform gives you a live window into your properties. You see progress. You see delays. You see when milestones are reached. You know when it is time to release funds. You know when to pause spending. You know when a project deserves more capital. This level of control turns remote investing into informed investing.
          </p>
          <p>
            ProveForMe removes the blind spots that drain profit. Traditional investors rely on phone calls, emails, and secondhand updates. Those channels filter reality. ProveForMe replaces that with verified status updates tied to each property. Each project lives inside a secure dashboard. Every update becomes part of a clear record. Nothing is lost. Nothing is hidden.
          </p>
          <p>
            Trust in real estate comes from proof. Lenders demand it. Partners demand it. You deserve it. ProveForMe makes proof the standard. You no longer chase answers. You receive them.
          </p>
          <p>
            The platform fits how modern investors operate. You manage multiple properties. You track budgets. You coordinate with multiple vendors. ProveForMe organizes all of it. Each property has its own workspace. Each visit has its own record. Each decision has supporting data. You move faster because you see more.
          </p>
          <p>
            Distance no longer limits your reach. You invest in new cities. You expand into new markets. You do not wait for flights or site visits. You stay informed from anywhere. Your portfolio grows without sacrificing oversight.
          </p>
          <p>
            This matters even more during renovations. Rehab projects move through phases. Demolition. Framing. Electrical. Plumbing. Finishes. Each phase changes the value of the asset. ProveForMe lets you verify when each phase is complete. You tie payments to real progress. You protect your capital.
          </p>
          <p>
            Disputes shrink when proof exists. Misunderstandings disappear. Expectations stay aligned. ProveForMe creates a shared source of truth. Every stakeholder sees the same data. Every decision is backed by records.
          </p>
          <p>
            Security stands at the core of the platform. Each account stays private. Each project stays restricted to its authorized users. Sensitive data remains protected. You control who sees what. You control when funds move. You control when a project closes.
          </p>
          <p>
            Automation keeps everything running smoothly. Funds stay in a pending state until you approve release. Deadlines enforce accountability. Time based rules prevent stalled projects. The system works while you focus on growth.
          </p>
          <p>
            ProveForMe also builds accountability into every interaction. Each project has defined terms. Each visit has a clear scope. Each result faces review. Performance stays visible. Standards stay high.
          </p>
          <p>
            This approach changes how investors operate. You stop guessing. You stop relying on vague updates. You stop worrying about hidden issues. You start managing with confidence.
          </p>
          <p>
            The platform also protects your time. You no longer coordinate site visits. You no longer chase updates. You no longer wait for someone to answer the phone. Everything lives in one place. You log in. You see what matters. You act.
          </p>
          <p>
            This saves money. Travel costs disappear. Delays shrink. Problems surface early. Early action costs less than late fixes. ProveForMe pays for itself by reducing waste and preventing loss.
          </p>
          <p>
            It also supports better lending and refinancing. Verified project records strengthen your position. You show lenders clear progress. You justify draw requests. You prove value creation. This improves deal flow.
          </p>
          <p>
            Your partners benefit as well. Joint venture investors gain transparency. Everyone stays aligned. Trust grows. Relationships last.
          </p>
          <p>
            The platform scales with you. One property or one hundred. One city or many. ProveForMe handles the load. You keep clarity across your entire portfolio.
          </p>
          <p>
            Compliance also improves. Records stay stored. Activity stays logged. You maintain a clean audit trail. This protects you during disputes, tax reviews, and legal questions.
          </p>
          <p>
            ProveForMe does not replace your team. It strengthens it. Everyone works from the same data. Everyone stays accountable. Everyone performs better.
          </p>
          <p>
            The result is simple. You gain control. You gain speed. You gain confidence. Your investments perform better because you see what is happening.
          </p>
          <p>
            This is the future of real estate oversight. Digital. Verified. Structured. Secure.
          </p>
          <p>
            ProveForMe gives you the power to invest anywhere with the confidence of being on site. You manage by facts. You act with precision. You grow without fear.
          </p>
          <p>
            Every serious investor understands one truth. You do not manage what you cannot see. ProveForMe makes your entire portfolio visible.
          </p>
          <p className="font-semibold">
            That is why it exists. That is why it works. That is why it will change how you invest.
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
              &copy; 2025 ProveForMe.com All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
