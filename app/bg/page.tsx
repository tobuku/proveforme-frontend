"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type UserRole = "INVESTOR" | "BG";

type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string;
};

type StripeStatus = {
  onboarded: boolean;
  stripeAccountId?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  message?: string;
};

type VisitForBg = {
  id: string;
  projectId: string;
  bgId: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    city: string;
    state: string;
  };
};

type AvailableProject = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  payPerVisit: string;
  scopeOfWork: string[];
  status: string;
  createdAt: string;
  investor: {
    firstName: string;
    lastName: string;
  };
};

type BgVisitsResponse = {
  ok: boolean;
  visits: VisitForBg[];
};

export default function BgDashboardPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [visits, setVisits] = useState<VisitForBg[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stripe onboarding state
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Service zip codes state
  const [serviceZipCodes, setServiceZipCodes] = useState<string[]>([]);
  const [newZipCode, setNewZipCode] = useState("");
  const [savingZips, setSavingZips] = useState(false);
  const [zipSaveSuccess, setZipSaveSuccess] = useState(false);

  // Available projects state
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [expressingInterest, setExpressingInterest] = useState<string | null>(null);
  const [interestSuccess, setInterestSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("pfm_token");
    const userJson = localStorage.getItem("pfm_user");

    if (!token || !userJson) {
      setError("Not logged in. Please log in as a BG user first.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userJson) as AuthUser;
      setAuthUser(user);
      setAuthToken(token);

      const roleUpper = (user.role || "").toString().toUpperCase();
      if (roleUpper !== "BG") {
        setError(
          `This page is for Boots on the Ground (BG) users only. You are logged in as ${roleUpper}.`
        );
        setLoading(false);
        return;
      }

      // Fetch BG's data
      fetchBgVisits(token);
      fetchStripeStatus(token);
      fetchUserProfile(token);
      fetchAvailableProjects(token);
    } catch {
      setError("Failed to read login info. Try logging in again.");
      setLoading(false);
    }
  }, []);

  async function fetchUserProfile(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.serviceZipCodes) {
          setServiceZipCodes(data.user.serviceZipCodes);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }

  async function fetchAvailableProjects(token: string) {
    try {
      setProjectsLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/projects/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch available projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  }

  async function saveServiceZipCodes() {
    if (!authToken) return;

    setSavingZips(true);
    setZipSaveSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/service-zipcodes`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zipCodes: serviceZipCodes }),
      });

      if (res.ok) {
        const data = await res.json();
        setServiceZipCodes(data.serviceZipCodes || []);
        setZipSaveSuccess(true);
        // Refresh available projects with new zip codes
        fetchAvailableProjects(authToken);
        setTimeout(() => setZipSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save zip codes:", err);
    } finally {
      setSavingZips(false);
    }
  }

  function addZipCode() {
    const zip = newZipCode.trim();
    if (zip && !serviceZipCodes.includes(zip)) {
      setServiceZipCodes([...serviceZipCodes, zip]);
      setNewZipCode("");
    }
  }

  function removeZipCode(zip: string) {
    setServiceZipCodes(serviceZipCodes.filter((z) => z !== zip));
  }

  async function expressInterest(projectId: string) {
    if (!authToken) return;

    setExpressingInterest(projectId);
    setInterestSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/interest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setInterestSuccess(projectId);
        setTimeout(() => setInterestSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to express interest:", err);
    } finally {
      setExpressingInterest(null);
    }
  }

  async function fetchStripeStatus(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/connect/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStripeStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Stripe status:", err);
    }
  }

  async function startStripeOnboarding() {
    if (!authToken) return;

    setStripeLoading(true);
    setStripeError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/connect/onboard`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setStripeError(data.error || "Failed to start onboarding");
        return;
      }

      // Redirect to Stripe onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (err) {
      setStripeError("Network error starting onboarding");
    } finally {
      setStripeLoading(false);
    }
  }

  async function fetchBgVisits(token: string) {
    try {
      setLoading(true);
      setError(null);
      setVisits(null);

      const res = await fetch(`${API_BASE}/api/v1/visits/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load visits (${res.status}): ${
            text || "Unknown error"
          }`
        );
      }

      const data = (await res.json()) as BgVisitsResponse;
      if (!data.ok) {
        throw new Error("Backend reported an error loading visits.");
      }

      setVisits(data.visits);
    } catch (err: any) {
      setError(err.message || "Failed to load visits.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pfm_token");
      localStorage.removeItem("pfm_user");
      localStorage.removeItem("pfm_role");
    }
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-6 rounded-2xl bg-gray-100 border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-black">BG Dashboard</h1>
            <p className="text-xs text-gray-600">
              Find projects in your area and manage your visits.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px]">
            {authUser ? (
              <>
                <p className="text-gray-700">
                  Logged in as{" "}
                  <span className="font-semibold">
                    {authUser.firstName} {authUser.lastName}
                  </span>{" "}
                  (
                  <span className="font-mono">
                    {(authUser.role || "").toString().toUpperCase()}
                  </span>
                  )
                </p>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded border border-gray-400 bg-white text-[11px] hover:bg-gray-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <p className="text-gray-500">
                Not logged in yet. Use{" "}
                <span className="font-mono">/login</span> to authenticate.
              </p>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Stripe Onboarding Section */}
            <section className="p-4 rounded-xl bg-white border border-gray-300 space-y-3">
              <h2 className="text-sm font-semibold text-black">Payment Setup</h2>

              {stripeStatus?.onboarded ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-xs text-green-700">
                    Your payment account is set up and ready to receive payments.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    To receive payments for your work, you need to set up your Stripe account.
                  </p>

                  {stripeError && (
                    <p className="text-xs text-red-600">{stripeError}</p>
                  )}

                  <button
                    onClick={startStripeOnboarding}
                    disabled={stripeLoading}
                    className="px-4 py-2 rounded bg-black text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50"
                  >
                    {stripeLoading
                      ? "Starting..."
                      : stripeStatus?.stripeAccountId
                      ? "Continue Setup"
                      : "Set Up Payments"}
                  </button>
                </div>
              )}
            </section>

            {/* Service Zip Codes Section */}
            <section className="p-4 rounded-xl bg-white border border-gray-300 space-y-3">
              <h2 className="text-sm font-semibold text-black">Service Area (Zip Codes)</h2>
              <p className="text-xs text-gray-600">
                Add the zip codes where you can provide property visits. Projects in these areas will appear below.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newZipCode}
                  onChange={(e) => setNewZipCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addZipCode()}
                  placeholder="Enter zip code"
                  maxLength={10}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-gray-500"
                />
                <button
                  onClick={addZipCode}
                  className="px-3 py-2 rounded bg-black text-white text-xs font-semibold hover:bg-gray-800"
                >
                  Add
                </button>
              </div>

              {serviceZipCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {serviceZipCodes.map((zip) => (
                    <span
                      key={zip}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs"
                    >
                      {zip}
                      <button
                        onClick={() => removeZipCode(zip)}
                        className="hover:text-red-600"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={saveServiceZipCodes}
                disabled={savingZips}
                className="px-4 py-2 rounded bg-gray-200 text-black text-xs font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                {savingZips ? "Saving..." : "Save Zip Codes"}
              </button>

              {zipSaveSuccess && (
                <p className="text-xs text-green-600">Zip codes saved!</p>
              )}
            </section>

            {/* My Visits Section */}
            <section className="p-4 rounded-xl bg-white border border-gray-300 space-y-3">
              <h2 className="text-sm font-semibold text-black">My Assigned Visits</h2>

              {loading && (
                <p className="text-xs text-gray-500">Loading your visits...</p>
              )}

              {error && (
                <div className="p-3 rounded bg-red-100 border border-red-300 text-xs text-red-700">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              {!loading && !error && visits && visits.length === 0 && (
                <p className="text-xs text-gray-500">
                  You don&apos;t have any assigned visits yet.
                </p>
              )}

              {!loading && !error && visits && visits.length > 0 && (
                <div className="space-y-2 max-h-[20rem] overflow-y-auto pr-1 text-xs">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1"
                    >
                      <p className="text-[11px] text-gray-700">
                        <span className="font-semibold">Status:</span> {v.status}
                      </p>
                      <p className="text-[11px] text-gray-700">
                        <span className="font-semibold">Project:</span>{" "}
                        {v.project.title} ({v.project.city}, {v.project.state})
                      </p>
                      {v.notes && (
                        <p className="text-[11px] text-gray-600 mt-1">
                          <span className="font-semibold">Notes:</span> {v.notes}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-500 mt-1">
                        Scheduled: {new Date(v.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Available Projects */}
          <section className="p-4 rounded-xl bg-white border border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black">Available Projects</h2>
              {serviceZipCodes.length === 0 && (
                <span className="text-[10px] text-yellow-600">
                  Add zip codes to filter
                </span>
              )}
            </div>

            {projectsLoading ? (
              <p className="text-xs text-gray-500">Loading projects...</p>
            ) : availableProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">
                  {serviceZipCodes.length === 0
                    ? "Add your service zip codes to see available projects in your area."
                    : "No projects available in your service areas yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[40rem] overflow-y-auto pr-1">
                {availableProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">
                          {project.city}, {project.state} {project.zipCode && `- ${project.zipCode}`}
                        </p>
                        <h3 className="text-sm font-semibold text-black">
                          {project.title}
                        </h3>
                      </div>
                      <span className="text-sm font-bold text-green-700">
                        ${project.payPerVisit}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-xs text-gray-600">
                        {project.description}
                      </p>
                    )}

                    {project.scopeOfWork && project.scopeOfWork.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-gray-500">Scope of Work:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.scopeOfWork.slice(0, 6).map((item) => (
                            <span
                              key={item}
                              className="px-1.5 py-0.5 rounded bg-gray-200 text-[9px] text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                          {project.scopeOfWork.length > 6 && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-200 text-[9px] text-gray-500">
                              +{project.scopeOfWork.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <p className="text-[10px] text-gray-500">
                        Posted by {project.investor.firstName} {project.investor.lastName} •{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => expressInterest(project.id)}
                        disabled={expressingInterest === project.id || interestSuccess === project.id}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          interestSuccess === project.id
                            ? "bg-green-600 text-white"
                            : "bg-black text-white hover:bg-gray-800"
                        } disabled:opacity-50`}
                      >
                        {expressingInterest === project.id
                          ? "Sending..."
                          : interestSuccess === project.id
                          ? "Interest Sent!"
                          : "Express Interest"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
