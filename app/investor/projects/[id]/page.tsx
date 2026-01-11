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
        <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
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

        // Load available BGs (users with role BG who are onboarded)
        const bgsRes = await fetch(`${API_BASE}/api/v1/users/bgs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bgsRes.ok) {
          const data = await bgsRes.json();
          setAvailableBGs((data.bgs || data || []).filter((bg: BG) => bg.stripeOnboarded));
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
          className="mb-4 text-xs text-indigo-500 hover:underline"
        >
          &larr; Back to Dashboard
        </button>

        {/* Project header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-indigo-500">
            {project.city}, {project.state}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Pay per visit: <span className="font-semibold">${project.payPerVisit}</span>
          </p>
        </div>

        {/* Success message */}
        {fundingSuccess && (
          <div className="mb-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">
            Payment successful! The funds are now held in escrow.
          </div>
        )}

        {/* Fund Boots on the Ground Section */}
        <section className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Fund Boots on the Ground
          </h2>
          <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">
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
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select BG (Boots on the Ground)
                </label>
                <select
                  value={selectedBG}
                  onChange={(e) => setSelectedBG(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                >
                  <option value="">-- Select a BG --</option>
                  {availableBGs.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.firstName} {bg.lastName} ({bg.email})
                    </option>
                  ))}
                </select>
                {availableBGs.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    No Boots on the Ground available yet. BGs must register and complete their payment setup before they can be assigned to projects.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                />
              </div>

              {fundingError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fundingError}
                </p>
              )}

              <button
                onClick={handleFundProject}
                disabled={fundingLoading || !selectedBG || !fundAmount}
                className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
              >
                {fundingLoading ? "Setting up payment..." : "Fund This BG"}
              </button>
            </div>
          )}
        </section>

        {/* Payments History */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <p className="text-xs text-slate-500">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
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
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : payment.status === "FUNDED"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : payment.status === "FAILED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
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
