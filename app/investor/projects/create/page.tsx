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

// Scope of Work categories and items (removed "Other" category)
const SCOPE_OF_WORK_OPTIONS = {
  "General": [
    "Posted Permits",
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
    <div className="min-h-screen bg-white">
      <AuthedHeader role={user?.role ?? null} />

      <main className="mx-auto max-w-2xl p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Create New Project
          </h1>
          <p className="text-sm text-slate-600">
            Set up a property for Boots on the Ground visits.
          </p>
        </header>

        {/* Important Notice */}
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Important:</p>
          <p>
            Please review all information carefully before submitting. If you notice any errors after creating a project,
            you will need to delete the project from the project detail page and create a new one with the correct information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {error && (
            <div className="rounded-md border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Property Information */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-black border-b border-slate-200 pb-2">
              Property Information
            </h2>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Title *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: San Antonio rehab walk through"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short notes about the project, rehab scope, or visit expectations."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-black">
                  City *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Antonio"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-black">
                  State *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="TX"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-black">
                  Zip Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="78201"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Full Address
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="1234 Sample St, San Antonio, TX 78201"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">
                Pay Per Visit (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                value={payPerVisit}
                onChange={(e) => setPayPerVisit(e.target.value)}
                placeholder="75"
              />
            </div>
          </section>

          {/* Scope of Work */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-semibold text-black">
                Scope of Work
              </h2>
              <span className="text-sm text-slate-600">
                {selectedScope.length} items selected
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Select items below that you need the BG to document during their visit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SCOPE_OF_WORK_OPTIONS).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0066FF]">{category}</h3>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => selectAllInCategory(category)}
                        className="text-xs text-slate-500 hover:text-[#0066FF]"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => deselectAllInCategory(category)}
                        className="text-xs text-slate-500 hover:text-[#0066FF]"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 cursor-pointer text-sm text-black hover:text-[#0066FF]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScope.includes(item)}
                          onChange={() => toggleScopeItem(item)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0066FF] focus:ring-[#0066FF]"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/investor")}
              className="text-sm text-slate-600 hover:text-black"
            >
              Cancel and go back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#0066FF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
