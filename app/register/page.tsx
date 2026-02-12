"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => { document.title = "Create Account \u2014 ProveForMe"; }, []);

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
        "Account created! A verification email has been sent to your inbox. Please check your email and click the verification link before logging in."
      );

      // Redirect after giving the user time to read the verification notice
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err: any) {
      console.error("Register error", err);
      setFormError("Network error: failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-slate-500 hover:text-slate-700 mb-2"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Create your ProveForMe account
        </h1>
        <p className="text-xs text-slate-500 mb-4">
          Choose <span className="font-semibold">Investor</span> if you post
          projects, or <span className="font-semibold">BG</span> if you&apos;re
          Boots on the Ground.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                First name
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                Last name
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <span className="block text-xs text-slate-600 mb-1">
              Role (what are you here to do?)
            </span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole("INVESTOR")}
                className={`flex-1 rounded border px-2 py-1 ${
                  role === "INVESTOR"
                    ? "border-[#0066FF] bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-slate-600 hover:border-slate-500"
                }`}
              >
                I&apos;m an Investor
              </button>
              <button
                type="button"
                onClick={() => setRole("BG")}
                className={`flex-1 rounded border px-2 py-1 ${
                  role === "BG"
                    ? "border-[#0066FF] bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-slate-600 hover:border-slate-500"
                }`}
              >
                I&apos;m Boots on the Ground (BG)
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-800 bg-red-50 border border-red-300 rounded px-2 py-1">
              {formError}
            </p>
          )}

          {successMessage && (
            <div className="text-xs text-blue-800 bg-blue-50 border border-blue-300 rounded px-3 py-2 space-y-1">
              <p className="font-semibold">{successMessage}</p>
              <p className="text-[10px] text-blue-600">Redirecting to login page...</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium py-2 mt-1 text-white"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-slate-500">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#0066FF] hover:text-[#0052CC] underline-offset-2 hover:underline"
          >
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
}
