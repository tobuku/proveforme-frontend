"use client";

import { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type RoleOption = "investor" | "bg";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState<RoleOption>("investor");
  const [message, setMessage]     = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            role, // "investor" or "bg"
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setMessage("✅ Account created! You can now log in on the /login page.");
      // Optionally clear form:
      // setFirstName(""); setLastName(""); setEmail(""); setPassword("");
    } catch (err: any) {
      setMessage(`⚠️ ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-1">Create your ProveForMe account</h1>
        <p className="text-xs text-slate-400 mb-4">
          Choose Investor if you post projects, or BG if you&apos;re Boots on the Ground.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption)}
          >
            <option value="investor">Investor</option>
            <option value="bg">Boots on the Ground (BG)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-slate-200 whitespace-pre-line">
            {message}
          </p>
        )}

        <p className="mt-4 text-[11px] text-slate-500">
          Already registered?{" "}
          <a
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Go to login
          </a>
        </p>
      </div>
    </main>
  );
}
