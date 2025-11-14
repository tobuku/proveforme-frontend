"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [backendUrlForDisplay, setBackendUrlForDisplay] = useState(BACKEND_URL);

  useEffect(() => {
    setBackendUrlForDisplay(BACKEND_URL);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();
      let data: any = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(
          `Login request failed with status ${res.status}. Response was not JSON.`
        );
      }

      if (!res.ok || !data || data.ok === false) {
        const message =
          data?.error ||
          `Login failed with status ${res.status}. Please check your email and password.`;
        throw new Error(message);
      }

      // Try to read token/role directly from login response
      let token: string | undefined =
        data.token || data.accessToken || data.jwt || undefined;
      let role: string | undefined =
        data.role ||
        data.user?.role ||
        data.user?.type ||
        data.userRole ||
        undefined;

      if (!token) {
        throw new Error("Login succeeded but token is missing from response.");
      }

      // If no role yet, try /auth/me
      if (!role) {
        try {
          const meRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const meRaw = await meRes.text();
          let meData: any = null;
          try {
            meData = meRaw ? JSON.parse(meRaw) : null;
          } catch {
            console.warn("Failed to parse /auth/me response as JSON");
          }

          if (meRes.ok && meData) {
            role =
              meData.user?.role ||
              meData.role ||
              meData.user?.type ||
              meData.userRole ||
              role;
          }
        } catch (innerErr) {
          console.warn("Failed to fetch /auth/me for role discovery:", innerErr);
        }
      }

      // If we *still* don't have a role, default to INVESTOR so the app remains usable
      if (!role) {
        console.warn(
          "Login succeeded with token but no role. Defaulting to INVESTOR."
        );
        role = "INVESTOR";
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("pfm_token", token);
        localStorage.setItem("pfm_role", role);
        localStorage.setItem("pfm_email", email);
      }

      if (role === "BG") {
        router.push("/bg");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 bg-slate-900/70 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            ProveForMe Login
          </h1>
          <p className="text-xs text-slate-300">
            Securely access your member dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-xs">
            <label className="block text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-[11px] text-rose-400 bg-rose-950/50 border border-rose-700 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold py-2 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-300"
          >
            ← Back to Homepage
          </Link>
          <Link
            href="/register"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Need an account? Register
          </Link>
        </div>

        <div className="mt-3 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
          <p className="mb-1">
            Frontend → backend:{" "}
            <span className="font-mono break-all">{backendUrlForDisplay}</span>
          </p>
          <p>
            If login fails with &quot;User not found&quot;, that&apos;s coming
            from the backend and usually means the account hasn&apos;t been
            seeded/registered in this environment yet.
          </p>
        </div>
      </div>
    </div>
  );
}
