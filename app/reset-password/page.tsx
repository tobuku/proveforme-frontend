"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { document.title = "Set New Password \u2014 ProveForMe"; }, []);

  if (!token) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8 text-sm">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0066FF]">
              ProveForMe
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Invalid reset link
            </h1>
          </div>

          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
            No reset token found. Please request a new password reset link.
          </div>

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
              onClick={() => router.push("/forgot-password")}
              className="hover:text-slate-900"
            >
              Request new reset link
            </button>
          </div>
        </main>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      let data: { ok?: boolean; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("Server did not return a valid response.");
        setLoading(false);
        return;
      }

      if (!res.ok || !data.ok) {
        setError(
          data.error ||
            "Reset failed. Your link may be invalid or expired."
        );
        setLoading(false);
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("Network error during reset-password", err);
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
            Set a new password
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            Enter your new password below. It must be at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
              {(error.includes("invalid") || error.includes("expired")) && (
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="ml-1 underline hover:text-red-600"
                >
                  Request a new link
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0066FF]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0066FF]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-[#0066FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-4 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="hover:text-slate-900"
          >
            &larr; Back to Login
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
