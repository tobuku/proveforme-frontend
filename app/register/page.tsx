"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type Role = "INVESTOR" | "BG";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("INVESTOR");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!password || !passwordConfirm) {
      setFormError("Please enter and confirm your password.");
      return;
    }

    if (password !== passwordConfirm) {
      setFormError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          `Create account failed (status ${res.status}). Please try again.`;
        setFormError(msg);
        return;
      }

      setSuccessMessage(
        "Account created successfully. You can now log in on the login page."
      );

      // Optional: redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Register error", err);
      setFormError("Network error: failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-slate-400 hover:text-slate-200 mb-2"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-xl font-semibold text-slate-50 mb-1">
          Create your ProveForMe account
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Choose <span className="font-semibold">Investor</span> if you post
          projects, or <span className="font-semibold">BG</span> if you&apos;re
          Boots on the Ground.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-300 mb-1">
                First name
              </label>
              <input
                type="text"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-300 mb-1">
                Last name
              </label>
              <input
                type="text"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-300 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <span className="block text-xs text-slate-300 mb-1">
              Role (what are you here to do?)
            </span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole("INVESTOR")}
                className={`flex-1 rounded border px-2 py-1 ${
                  role === "INVESTOR"
                    ? "border-teal-500 bg-teal-900/40 text-teal-200"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
              >
                I&apos;m an Investor
              </button>
              <button
                type="button"
                onClick={() => setRole("BG")}
                className={`flex-1 rounded border px-2 py-1 ${
                  role === "BG"
                    ? "border-teal-500 bg-teal-900/40 text-teal-200"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
              >
                I&apos;m a Prover (BG)
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded px-2 py-1">
              ⚠️ {formError}
            </p>
          )}

          {successMessage && (
            <p className="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded px-2 py-1">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium py-2 mt-1"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-slate-400">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-teal-300 hover:text-teal-200 underline-offset-2 hover:underline"
          >
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
}
