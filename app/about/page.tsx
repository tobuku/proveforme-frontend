"use client";

import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
          About Us
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 mb-6">
            ProveForMe.com was made by Investors for Investors.
          </p>

          <p className="text-slate-600 mb-4">
            We understand the challenges of managing real estate investments remotely.
            Whether you're investing in properties across the country or around the world,
            you need reliable eyes on the ground to verify conditions, document progress,
            and ensure your investments are protected.
          </p>

          <p className="text-slate-600 mb-4">
            That's why we created ProveForMe - a platform that connects remote investors
            with trusted local professionals who can serve as their "Boots on the Ground" (BG).
            Our BGs conduct property visits, capture timestamped photos and videos, and provide
            detailed documentation so you always know exactly what's happening with your properties.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-slate-600 mb-4">
            To provide remote real estate investors with the peace of mind that comes from
            having verified, documented proof of property conditions - without having to be
            physically present.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">How It Works</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
            <li>Investors create projects for properties they need documented</li>
            <li>Local BGs in the property's area can view and express interest in projects</li>
            <li>Investors fund visits through our secure payment platform</li>
            <li>BGs conduct visits and upload timestamped photos and videos</li>
            <li>Investors review documentation and release payment when satisfied</li>
          </ul>

          <p className="text-slate-600">
            With ProveForMe, you get the verification you need with complete transparency
            and security at every step.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-[11px] text-slate-500">
          <p>&copy; 2025 ProveForMe.com All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
