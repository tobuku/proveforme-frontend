"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  ok: boolean;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  error?: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Login failed (${res.status}). ${text || "Unknown error."}`
        );
      }

      const data = (await res.json()) as LoginResponse;

      if (!data.ok || !data.token || !data.user) {
        throw new Error(data.error || "Invalid login response from server.");
      }

      // Store auth info in localStorage for the dashboard to use
      if (typeof window !== "undefined") {
        localStorage.setItem("pfm_token", data.token);
        localStorage.setItem("pfm_user", JSON.stringify(data.user));
      }

      const role = (data.user.role || "").toString().toUpperCase();

      setSuccessMessage(
        `Logged in as ${data.user.firstName} ${data.user.lastName} (${role}). Redirecting to dashboard…`
      );

      // Simple role-aware redirect:
      // For now, both land on the main dashboard (/),
      // but this is where we'd branch later if we create
      // dedicated routes like /investor-dashboard or /bg-dashboard.
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-md px-6 py-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">ProveForMe Login</h1>
          <p className="mt-1 text-xs text-slate-300">
            Connect investors and boots-on-the-ground with verified access.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="block text-slate-200 text-xs" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-slate-200 text-xs"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold text-sm border border-emerald-400 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-700/70 text-xs">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-700/60 text-xs text-emerald-50">
            {successMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="underline hover:text-slate-200"
          >
            ← Back to dashboard
          </button>
          <p>
            Tip: use{" "}
            <span className="font-mono text-slate-200">
              alice@example.com / password123
            </span>{" "}
            (Investor) or your BG test user.
          </p>
        </div>
      </div>
    </main>
  );
}
