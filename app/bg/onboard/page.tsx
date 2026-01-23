"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type StripeStatus = {
  ok: boolean;
  onboarded: boolean;
  stripeAccountId?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  message?: string;
};

export default function BgOnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "incomplete" | "error">("loading");
  const [message, setMessage] = useState("");
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);

  const isSuccess = searchParams.get("success") === "true";
  const isRefresh = searchParams.get("refresh") === "true";

  useEffect(() => {
    const token = localStorage.getItem("pfm_token");

    if (!token) {
      setStatus("error");
      setMessage("Not logged in. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    // Check Stripe onboarding status
    async function checkStatus() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/payments/connect/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to check onboarding status");
        }

        const data: StripeStatus = await res.json();
        setStripeStatus(data);

        if (data.onboarded) {
          setStatus("success");
          setMessage("Your payment account is fully set up! Redirecting to dashboard...");
          setTimeout(() => router.push("/bg"), 3000);
        } else if (isRefresh) {
          setStatus("incomplete");
          setMessage("Your onboarding session expired. Please continue setup from the dashboard.");
        } else if (isSuccess) {
          // User returned with success but not fully onboarded yet
          // This can happen if Stripe needs more info
          if (data.detailsSubmitted) {
            setStatus("incomplete");
            setMessage("Almost there! Stripe is reviewing your information. This usually takes a few moments.");
            // Poll for status update
            setTimeout(() => checkStatus(), 3000);
          } else {
            setStatus("incomplete");
            setMessage("Please complete the remaining onboarding steps from the dashboard.");
          }
        } else {
          setStatus("incomplete");
          setMessage("Onboarding not complete. Redirecting to dashboard...");
          setTimeout(() => router.push("/bg"), 2000);
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setStatus("error");
        setMessage("Error checking onboarding status. Redirecting to dashboard...");
        setTimeout(() => router.push("/bg"), 2000);
      }
    }

    checkStatus();
  }, [router, isSuccess, isRefresh]);

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          {status === "loading" && (
            <>
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-gray-200 border-t-black animate-spin" />
              <h1 className="text-xl font-bold">Checking Onboarding Status...</h1>
              <p className="text-sm text-gray-600">Please wait while we verify your payment setup.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-green-700">Payment Setup Complete!</h1>
              <p className="text-sm text-gray-600">{message}</p>
              {stripeStatus && (
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Details Submitted: {stripeStatus.detailsSubmitted ? "Yes" : "No"}</p>
                  <p>Charges Enabled: {stripeStatus.chargesEnabled ? "Yes" : "No"}</p>
                  <p>Payouts Enabled: {stripeStatus.payoutsEnabled ? "Yes" : "No"}</p>
                </div>
              )}
            </>
          )}

          {status === "incomplete" && (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-yellow-400 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-yellow-700">Onboarding Incomplete</h1>
              <p className="text-sm text-gray-600">{message}</p>
              <button
                onClick={() => router.push("/bg")}
                className="mt-4 px-6 py-2 rounded bg-black text-white text-sm font-semibold hover:bg-gray-800"
              >
                Go to Dashboard
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-700">Something Went Wrong</h1>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400">
          ProveForMe.com - Secure payment processing powered by Stripe
        </p>
      </div>
    </main>
  );
}
