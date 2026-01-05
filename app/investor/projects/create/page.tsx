"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthedHeader } from "../../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type AuthUser = {
  id: string;
  email: string;
  role: "INVESTOR" | "BG";
  firstName?: string | null;
  lastName?: string | null;
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [payPerVisit, setPayPerVisit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("pfm_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      }
    } catch (err) {
      console.error("Failed to read user from storage", err);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("pfm_token");
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    if (!title || !city || !stateVal || !payPerVisit) {
      setError("Title, city, state, and pay per visit are required.");
      return;
    }

    const numericPay = parseFloat(payPerVisit);
    if (Number.isNaN(numericPay) || numericPay <= 0) {
      setError("Pay per visit must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          city,
          state: stateVal,
          fullAddress,
          payPerVisit: numericPay,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse create project response", jsonErr);
        setError("Create project endpoint returned non JSON response.");
        setSubmitting(false);
        return;
      }

      if (!res.ok || !data.ok) {
        setError(
          data?.error || `Create project failed (status ${res.status}).`
        );
        setSubmitting(false);
        return;
      }

      router.push("/investor");
    } catch (err) {
      console.error("Network error creating project", err);
      setError("Network error while creating project.");
      setSubmitting(false);
    }
  }

  return (
    <div className="pfm-shell">
      <AuthedHeader role={user?.role ?? null} />

      <main className="mx-auto max-w-xl p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create new project
          </h1>
          <p className="text-xs text-slate-300">
            Set up a property for Boots on the Ground visits.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Title *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: San Antonio rehab walk through"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Description
            </label>
            <textarea
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short notes about the project, rehab scope, or visit expectations."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                City *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Antonio"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                State *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                placeholder="TX"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Full address
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="1234 Sample St, San Antonio, TX 78201"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-200">
              Pay per visit (USD) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
              value={payPerVisit}
              onChange={(e) => setPayPerVisit(e.target.value)}
              placeholder="75"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/investor")}
              className="text-xs text-slate-300 hover:text-slate-100"
            >
              Cancel and go back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
