"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AuthedHeader } from "../../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

type Project = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  fullAddress?: string;
  payPerVisit: string;
  status: string | null;
};

type BG = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  stripeOnboarded: boolean;
  serviceZipCodes?: string | null;
};

type Payment = {
  id: string;
  amountTotal: number;
  platformFee: number;
  amountToBG: number;
  status: string;
  createdAt: string;
  bg: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type BgInterest = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  bg: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    city: string | null;
    state: string | null;
    stripeOnboarded: boolean;
  };
};

function CheckoutForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href + "?payment=success",
      },
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availableBGs, setAvailableBGs] = useState<BG[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment flow state
  const [selectedBG, setSelectedBG] = useState<string>("");
  const [fundAmount, setFundAmount] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  // BG Interests state
  const [interests, setInterests] = useState<BgInterest[]>([]);

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Check for payment success in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("payment") === "success") {
        setFundingSuccess(true);
        // Remove query param from URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // Auth check
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("pfm_token");
    const role = localStorage.getItem("pfm_role");
    if (!token || role !== "INVESTOR") {
      router.replace("/login");
    }
  }, [router]);

  // Load project data
  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("pfm_token");
      if (!token) return;

      try {
        // Load project
        const projectRes = await fetch(`${API_BASE}/api/v1/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (projectRes.ok) {
          const data = await projectRes.json();
          setProject(data.project || data);
          setFundAmount(data.project?.payPerVisit || data.payPerVisit || "");
        }

        // Load payments for this project
        const paymentsRes = await fetch(
          `${API_BASE}/api/v1/payments/project/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data.payments || []);
        }

        // Load available BGs (users with role BG)
        const bgsRes = await fetch(`${API_BASE}/api/v1/users/bgs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bgsRes.ok) {
          const data = await bgsRes.json();
          setAvailableBGs(data.bgs || data || []);
        }

        // Load BG interests for this project
        const interestsRes = await fetch(
          `${API_BASE}/api/v1/projects/${projectId}/interests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (interestsRes.ok) {
          const data = await interestsRes.json();
          setInterests(data.interests || []);
        }
      } catch (err) {
        console.error("Error loading project data:", err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Create payment intent
  const handleFundProject = async () => {
    if (!selectedBG || !fundAmount) {
      setFundingError("Please select a BG and enter an amount");
      return;
    }

    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setFundingLoading(true);
    setFundingError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/fund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          bgId: selectedBG,
          amount: parseFloat(fundAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFundingError(data.error || "Failed to create payment");
        setFundingLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentId(data.payment.id);
    } catch (err) {
      setFundingError("Network error creating payment");
    } finally {
      setFundingLoading(false);
    }
  };

  // Release payment
  const handleReleasePayment = async (paymentIdToRelease: string) => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/payments/release/${paymentIdToRelease}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        // Reload payments
        const paymentsRes = await fetch(
          `${API_BASE}/api/v1/payments/project/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data.payments || []);
        }
      }
    } catch (err) {
      console.error("Error releasing payment:", err);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push("/investor");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role="INVESTOR" />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-slate-600">Loading...</p>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role="INVESTOR" />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-red-600">Project not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pfm-shell">
      <AuthedHeader role="INVESTOR" />

      <main className="mx-auto max-w-3xl px-4 py-8 text-sm">
        {/* Back link */}
        <button
          onClick={() => router.push("/investor")}
          className="mb-4 text-xs text-gray-600 hover:underline"
        >
          &larr; Back to Dashboard
        </button>

        {/* Project header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {project.city}, {project.state}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-black">
                {project.title}
              </h1>
            </div>
            {project.status === "OPEN" && (
              <div className="flex gap-2">
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete Project
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteProject}
                      disabled={deleting}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {project.description && (
            <p className="mt-1 text-gray-600">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Pay per visit: <span className="font-semibold">${project.payPerVisit}</span>
          </p>
        </div>

        {/* Success message */}
        {fundingSuccess && (
          <div className="mb-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-800">
            Payment successful! The funds are now held in escrow.
          </div>
        )}

        {/* Fund Boots on the Ground Section */}
        <section className="mb-8 rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-black">
            Fund Boots on the Ground
          </h2>
          <p className="mb-4 text-xs text-gray-600">
            Select a BG to assign to this project and fund their visit. Payment will be held in escrow until you release it after the visit is completed.
          </p>

          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                onSuccess={() => setFundingSuccess(true)}
              />
            </Elements>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Select BG (Boots on the Ground)
                </label>
                {(() => {
                  // Filter BGs by matching zip codes
                  const projectZip = project?.zipCode?.trim() || "";
                  const matchingBGs = projectZip
                    ? availableBGs.filter((bg) => {
                        const bgZips = (bg.serviceZipCodes || "")
                          .split(",")
                          .map((z) => z.trim())
                          .filter((z) => z.length > 0);
                        return bgZips.includes(projectZip);
                      })
                    : availableBGs;

                  // Separate onboarded and non-onboarded BGs
                  const onboardedBGs = matchingBGs.filter((bg) => bg.stripeOnboarded);
                  const nonOnboardedBGs = matchingBGs.filter((bg) => !bg.stripeOnboarded);

                  return (
                    <>
                      <select
                        value={selectedBG}
                        onChange={(e) => setSelectedBG(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                      >
                        <option value="">-- Select a BG --</option>
                        {onboardedBGs.map((bg) => (
                          <option key={bg.id} value={bg.id}>
                            {bg.firstName} {bg.lastName} ({bg.email})
                          </option>
                        ))}
                        {nonOnboardedBGs.length > 0 && (
                          <optgroup label="-- Payment Setup Incomplete --">
                            {nonOnboardedBGs.map((bg) => (
                              <option key={bg.id} value={bg.id} disabled>
                                {bg.firstName} {bg.lastName} - Not ready for payments
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      {matchingBGs.length === 0 && projectZip && (
                        <p className="mt-1 text-xs text-amber-600">
                          No BGs service zip code {projectZip}. Try inviting BGs to add this area to their service zones.
                        </p>
                      )}
                      {matchingBGs.length === 0 && !projectZip && (
                        <p className="mt-1 text-xs text-slate-500">
                          No Boots on the Ground available yet. BGs must register before they can be assigned to projects.
                        </p>
                      )}
                      {onboardedBGs.length === 0 && nonOnboardedBGs.length > 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          BGs in this area need to complete their payment setup before they can receive funds.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                />
              </div>

              {fundingError && (
                <p className="text-xs text-red-600">
                  {fundingError}
                </p>
              )}

              <button
                onClick={handleFundProject}
                disabled={fundingLoading || !selectedBG || !fundAmount}
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {fundingLoading ? "Setting up payment..." : "Fund This BG"}
              </button>
            </div>
          )}
        </section>

        {/* BG Interests Section */}
        {interests.length > 0 && (
          <section className="mb-8 rounded-lg border border-gray-300 bg-gray-50 p-4">
            <h2 className="mb-4 text-sm font-semibold text-black">
              Interested BGs ({interests.length})
            </h2>
            <p className="mb-4 text-xs text-gray-600">
              These Boots on the Ground have expressed interest in this project. You can fund any of them above.
            </p>
            <div className="space-y-3">
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                >
                  <div>
                    <p className="text-xs font-medium text-black">
                      {interest.bg.firstName} {interest.bg.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {interest.bg.email}
                      {interest.bg.city && interest.bg.state && (
                        <span> • {interest.bg.city}, {interest.bg.state}</span>
                      )}
                    </p>
                    {interest.message && (
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        "{interest.message}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Interested {new Date(interest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        interest.bg.stripeOnboarded
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {interest.bg.stripeOnboarded ? "Ready for Payment" : "Setup Incomplete"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Payments History */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-black">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <p className="text-xs text-gray-500">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                >
                  <div>
                    <p className="text-xs font-medium text-black">
                      ${payment.amountTotal.toFixed(2)} to {payment.bg.firstName}{" "}
                      {payment.bg.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      BG receives: ${payment.amountToBG.toFixed(2)} | Platform fee: $
                      {payment.platformFee.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        payment.status === "RELEASED"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "FUNDED"
                          ? "bg-gray-200 text-gray-700"
                          : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : payment.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {payment.status === "PENDING" ? "Awaiting Payment" : payment.status}
                    </span>
                    {(payment.status === "FUNDED" || payment.status === "HELD") && (
                      <button
                        onClick={() => handleReleasePayment(payment.id)}
                        className="rounded bg-green-500 px-2 py-1 text-[10px] font-medium text-white hover:bg-green-400"
                      >
                        Release
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
