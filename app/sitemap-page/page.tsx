"use client";

import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">
          Sitemap
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Main Pages
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                  Home
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Welcome to ProveForMe</span>
              </li>
              <li>
                <Link href="/about" className="text-indigo-600 hover:text-indigo-500">
                  About Us
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Learn about our company</span>
              </li>
              <li>
                <Link href="/support" className="text-indigo-600 hover:text-indigo-500">
                  Support
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Contact us for help</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Account
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                  Register
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Create a new account</span>
              </li>
              <li>
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                  Login
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Access your dashboard</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Training
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/training" className="text-indigo-600 hover:text-indigo-500">
                  BG Training
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Learn how to take quality photos and videos</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Legal
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </Link>
                <span className="text-slate-400 text-sm ml-2">- Our terms and conditions</span>
              </li>
              <li>
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </Link>
                <span className="text-slate-400 text-sm ml-2">- How we handle your data</span>
              </li>
            </ul>
          </section>
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
