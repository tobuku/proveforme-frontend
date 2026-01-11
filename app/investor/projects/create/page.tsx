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

// Scope of Work categories and items
const SCOPE_OF_WORK_OPTIONS = {
  "General": [
    "Permits",
    "Foundation",
    "Demo",
    "Frame",
    "Drywall",
  ],
  "Interior Finishes": [
    "Int Doors and trim",
    "Floors and Baseboards",
    "Interior Paint",
    "Hardware",
  ],
  "Exterior": [
    "Exterior Paint",
    "Roof repair",
    "Exterior repairs",
    "Door and Window trims",
    "Siding and Facias trim",
    "Windows",
    "Skirting repair",
  ],
  "Kitchen": [
    "Kitchen",
    "Cabinets",
    "Countertops",
    "Sink and faucet",
    "Appliances",
  ],
  "Bathrooms": [
    "Bathrooms",
    "Tubs and Shower base",
    "Tub and shower surrounds",
    "Toilets",
    "Vanities",
    "Faucets",
    "Mirrors",
  ],
  "Systems": [
    "HVAC",
    "Electrical full rewire",
    "Plumbing",
  ],
  "Other": [
    "Draw Inspection Form",
  ],
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [payPerVisit, setPayPerVisit] = useState("");
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
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

  function toggleScopeItem(item: string) {
    setSelectedScope((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  }

  function selectAllInCategory(category: string) {
    const items = SCOPE_OF_WORK_OPTIONS[category as keyof typeof SCOPE_OF_WORK_OPTIONS];
    setSelectedScope((prev) => {
      const newSet = new Set(prev);
      items.forEach((item) => newSet.add(item));
      return Array.from(newSet);
    });
  }

  function deselectAllInCategory(category: string) {
    const items = SCOPE_OF_WORK_OPTIONS[category as keyof typeof SCOPE_OF_WORK_OPTIONS];
    setSelectedScope((prev) => prev.filter((item) => !items.includes(item)));
  }

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
          zipCode,
          fullAddress,
          payPerVisit: numericPay,
          scopeOfWork: selectedScope,
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

      <main className="mx-auto max-w-2xl p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create new project
          </h1>
          <p className="text-xs text-slate-300">
            Set up a property for Boots on the Ground visits.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {error && (
            <div className="rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Property Information */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-100 border-b border-slate-700 pb-2">
              Property Information
            </h2>

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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  Zip Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-400"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="78201"
                  maxLength={10}
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
          </section>

          {/* Scope of Work */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Scope of Work
              </h2>
              <span className="text-xs text-slate-400">
                {selectedScope.length} items selected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Select the items that the BG should inspect and document during their visit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SCOPE_OF_WORK_OPTIONS).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-indigo-400">{category}</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectAllInCategory(category)}
                        className="text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => deselectAllInCategory(category)}
                        className="text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScope.includes(item)}
                          onChange={() => toggleScopeItem(item)}
                          className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
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
