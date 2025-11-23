"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type LoginRole = "INVESTOR" | "BG";

type LoginResponse = {
  ok: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: LoginRole;
  };
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // If already logged in, send them to their dashboard instead of making them log in again
  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("pfm_token")
          : null;
      const rawUser =
        typeof window !== "undefined"
          ? localStorage.getItem("pfm_user")
          : null;

      if (token && rawUser) {
        const parsed = JSON.parse(rawUser) as { role?: LoginRole | null };
        const role = parsed?.role;

        if (role === "INVESTOR") {
          router.replace("/investor");
        } else if (role === "BG") {
          router.replace("/bg");
        } else {
          // Unknown role, clear and let them log in fresh
          localStorage.removeItem("pfm_token");
          localStorage.removeItem("pfm_user");
          localStorage.removeItem("pfm_role");
        }
      }
    } catch (err) {
      console.error("Error checking existing auth on login page", err);
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data: LoginResponse;
      try {
        data = (await res.json()) as LoginResponse;
      } catch (jsonErr) {
        console.error("Failed to parse login response as JSON", jsonErr);
        setError("Login failed: server did not return JSON.");
        setLoading(false);
        return;
      }

      if (!res.ok || !data.ok || !data.token || !data.user) {
        const message =
          data.error ||
          `Login failed with status ${res.status}. Please check your email and password.`;
        setError(message);
        setLoading(false);
        return;
      }

      // Store auth in localStorage
      try {
        localStorage.setItem("pfm_token", data.token);
        localStorage.setItem("pfm_user", JSON.stringify(data.user));
        localStorage.setItem("pfm_role", data.user.role);
      } catch (storageErr) {
        console.error("Failed to write auth to storage", storageErr);
      }

      // Redirect based on role
      if (data.user.role === "INVESTOR") {
        router.replace("/investor");
      } else if (data.user.role === "BG") {
        router.replace("/bg");
      } else {
        // Fallback: go to homepage if an unknown role somehow appears
        router.replace("/");
      }
    } catch (err) {
      console.error("Network error during login", err);
      setError("Network error while trying to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pfm-shell">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8 text-sm">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
            ProveForMe Login
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Securely access your member dashboard.
          </h1>
          <p className="mt-2 text-xs text-slate-300">
            Use the same email and password you registered with. After login,
            you will be sent directly to your Investor or BG dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-md border border-emerald-500 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
              {info}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="hover:text-slate-100"
          >
            ← Back to Homepage
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="hover:text-slate-100"
          >
            Need an account? Register
          </button>
        </div>

        <p className="mt-6 text-[10px] text-slate-500">
          Frontend → backend: {API_BASE}
        </p>
        <p className="text-[10px] text-slate-500">
          After login, valid sessions should go directly to your Investor or BG
          dashboard without requiring repeated logins, as long as your token
          remains valid.
        </p>
      </main>
    </div>
  );
}
