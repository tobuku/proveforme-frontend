"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AuthUser = {
  id: string;
  email: string;
  role: "INVESTOR" | "BG";
  firstName?: string | null;
  lastName?: string | null;
};

type LoginResponse =
  | {
      ok: true;
      token: string;
      role?: "INVESTOR" | "BG";
      user: AuthUser;
    }
  | {
      ok: false;
      error: string;
    };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors, we'll fall back to generic message
      }

      if (!res.ok || !data || data.ok === false) {
        const message =
          data?.error ||
          `Login failed with status ${res.status}. Please check your email and password.`;
        setError(message);
        return;
      }

      const loginData = data as LoginResponse & {
        token?: string;
        user?: AuthUser;
        role?: "INVESTOR" | "BG";
      };

      const token =
        (loginData as any).token ||
        (loginData as any).accessToken ||
        (loginData as any).jwt;
      const user =
        (loginData as any).user || (loginData as any).data?.user || null;
      const role =
        (loginData as any).role ||
        (user && (user as any).role) ||
        "INVESTOR";

      if (!token || !user) {
        setError("Login response was missing required fields.");
        return;
      }

      // Persist auth for homepage/dashboard
      try {
        localStorage.setItem("pfm_token", token);
        localStorage.setItem("pfm_role", role);
        localStorage.setItem("pfm_user", JSON.stringify(user));
      } catch (storageErr) {
        console.error("Failed to save auth info to localStorage", storageErr);
      }

      // Redirect based on role
      if (role === "BG") {
        window.location.href = "/bg";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Network error while logging in", err);
      setError("Network error: failed to reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* HEADER */}
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
            <Link href="/register" className="text-slate-300 hover:text-white">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            ProveForMe Login
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Securely access your member dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm"
        >
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:border-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:border-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md border border-amber-600/70 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="flex justify-between text-[11px] text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            ← Back to Homepage
          </Link>
          <div className="flex flex-col items-end gap-1">
            <p>
              Need an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-300 hover:text-indigo-200"
              >
                Register
              </Link>
            </p>
            <p className="text-[10px]">
              Frontend → backend: {API_BASE}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
