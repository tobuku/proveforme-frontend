"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function ConnectSuccessPage() {
  useEffect(() => { document.title = "Stripe Setup Complete \u2014 ProveForMe"; }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-lg flex-1 px-4 py-16 flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          You&rsquo;re all set with Stripe
        </h1>
        <p className="text-slate-600 text-sm mb-10">
          Your payment account has been connected. You can now receive payouts for completed visits.
        </p>

        {/* iOS App */}
        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-6 mb-4 text-left">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Using the iOS App?</p>
          <h2 className="text-base font-semibold text-slate-900 mb-2">Return to ProveForMe on your iPhone</h2>
          <p className="text-sm text-slate-600 mb-4">
            Switch back to the ProveForMe app on your phone. Your Stripe account is now linked and your dashboard will reflect the updated status.
          </p>
          <a
            href="https://apps.apple.com/us/app/proveforme/id6761230931"
            className="inline-flex items-center gap-2 rounded-lg bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Open on the App Store
          </a>
        </div>

        {/* Web Dashboard */}
        <div className="w-full rounded-xl border border-blue-200 bg-blue-50 p-6 text-left">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-blue-400 mb-1">Using the Web App?</p>
          <h2 className="text-base font-semibold text-slate-900 mb-2">Go to your BG Dashboard</h2>
          <p className="text-sm text-slate-600 mb-4">
            Head back to your dashboard to view available projects and manage your visits.
          </p>
          <Link
            href="/bg"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#0052CC] transition-colors"
          >
            Go to BG Dashboard &rarr;
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Questions? <Link href="/support" className="text-[#0066FF] hover:underline">Contact support</Link>
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-[11px] text-slate-500">
          <p>&copy; 2025 ProveForMe.com. All rights reserved. Owned and operated by Know Leap Strategies.</p>
        </div>
      </footer>
    </div>
  );
}
