"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);

    try {
      // Create mailto link as a fallback since we don't have a backend email service
      const mailtoLink = `mailto:info@knowleapstrategies.com?subject=${encodeURIComponent(
        `[ProveForMe Support] ${subject}`
      )}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;

      window.location.href = mailtoLink;
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Support
        </h1>
        <p className="text-slate-600 mb-8">
          Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
        </p>

        {submitted ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Thank you for contacting us!
            </h2>
            <p className="text-green-700 text-sm">
              Your email client should have opened with a pre-filled message.
              If it didn't, please email us directly at{" "}
              <a
                href="mailto:info@knowleapstrategies.com"
                className="underline hover:text-green-600"
              >
                info@knowleapstrategies.com
              </a>
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-green-600 hover:text-green-500 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                placeholder="Please describe your question or issue..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[#0066FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Other Ways to Reach Us
          </h2>
          <p className="text-sm text-slate-600 mb-2">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:info@knowleapstrategies.com"
              className="text-indigo-600 hover:text-indigo-500"
            >
              info@knowleapstrategies.com
            </a>
          </p>
          <p className="text-sm text-slate-600">
            <strong>Mail:</strong> 1785 S King St Suite 3, Honolulu, HI 96826, USA
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-[11px] text-slate-500">
          <p>&copy; 2025 ProveForMe.com. All rights reserved. Owned and operated by Know Leap Strategies.</p>
        </div>
      </footer>
    </div>
  );
}
