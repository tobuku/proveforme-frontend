"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Investor");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Creating account...");
    try {
      const res = await fetch(
        "https://proveforme-backend.onrender.com/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password, role }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setMessage("Account created! You can now log in.");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-sm space-y-3"
      >
        <h1 className="text-2xl font-bold">Register</h1>
        <div className="grid gap-2">
          <input
            placeholder="First Name"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            placeholder="Last Name"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            placeholder="Email"
            type="email"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Investor">Investor</option>
            <option value="BG">BG</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 rounded bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
        >
          Create Account
        </button>
        {message && <p className="text-xs mt-2 text-slate-300">{message}</p>}
      </form>
    </main>
  );
}
