"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "Verifying your email..." : "No verification token found."
  );

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/v1/users/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        let data: { ok?: boolean; message?: string; error?: string };
        try {
          data = await res.json();
        } catch {
          setStatus("error");
          setMessage("Server did not return a valid response.");
          return;
        }

        if (!res.ok || !data.ok) {
          setStatus("error");
          setMessage(
            data.error || "Verification failed. Your link may be invalid or expired."
          );
          return;
        }

        setStatus("success");
        setMessage(data.message || "Your email has been verified!");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-slate-900">
            ProveForMe
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Go to homepage
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Email Verification
          </p>

          {status === "loading" && (
            <>
              <h1 className="text-xl font-semibold tracking-tight">
                Verifying...
              </h1>
              <p className="text-sm text-slate-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-xl font-semibold tracking-tight">
                Email verified
              </h1>
              <p className="text-sm text-slate-600">{message}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block rounded-md bg-[#0066FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0052CC]"
                >
                  Log in to your account
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-xl font-semibold tracking-tight">
                Verification failed
              </h1>
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-800">
                {message}
              </div>
              <p className="text-sm text-slate-600">
                If your link has expired, log in and request a new verification
                email from your account page.
              </p>
              <div className="flex justify-center gap-3 pt-2 text-xs">
                <Link
                  href="/login"
                  className="rounded-md bg-[#0066FF] px-4 py-2 font-semibold text-white hover:bg-[#0052CC]"
                >
                  Log in
                </Link>
                <Link
                  href="/"
                  className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:border-slate-400"
                >
                  Go home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
