"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { document.title = "Reset Password \u2014 ProveForMe"; }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        setLoading(false);
        return;
      }

      // Always show generic success to avoid leaking whether the email exists
      setSuccess(
        "If an account with that email exists, a reset link has been sent."
      );
    } catch (err) {
      console.error("Network error during forgot-password", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8 text-sm">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#0066FF]">
            ProveForMe
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            Enter the email address you registered with and we&apos;ll send you
            a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0066FF]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-[#0066FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="hover:text-slate-900"
          >
            &larr; Back to Login
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="hover:text-slate-900"
          >
            Need an account? Register
          </button>
        </div>
      </main>
    </div>
  );
}
