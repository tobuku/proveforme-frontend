"use client";

import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: January 10, 2025</p>

        <div className="prose prose-slate prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p className="text-slate-600">
              ProveForMe.com ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <p className="text-slate-600 mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Property addresses and project details</li>
              <li>Photos and videos uploaded to the platform</li>
              <li>Communications with us or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Automatically Collected Information</h2>
            <p className="text-slate-600 mb-2">When you use our Service, we may automatically collect:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data and browsing patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. How We Use Your Information</h2>
            <p className="text-slate-600 mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
              <li>Personalize and improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Information Sharing</h2>
            <p className="text-slate-600 mb-2">We may share your information with:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Other users as necessary to facilitate transactions (e.g., sharing investor information with assigned BGs)</li>
              <li>Service providers who perform services on our behalf (e.g., Stripe for payment processing)</li>
              <li>Law enforcement or government agencies when required by law</li>
              <li>Other parties in connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Security</h2>
            <p className="text-slate-600">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the Internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention</h2>
            <p className="text-slate-600">
              We retain your personal information for as long as necessary to fulfill the purposes
              for which it was collected, comply with our legal obligations, resolve disputes,
              and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Your Rights</h2>
            <p className="text-slate-600 mb-2">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify or update your personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your personal data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Cookies</h2>
            <p className="text-slate-600">
              We use cookies and similar tracking technologies to track activity on our Service
              and hold certain information. You can instruct your browser to refuse all cookies
              or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Third-Party Links</h2>
            <p className="text-slate-600">
              Our Service may contain links to third-party websites. We are not responsible for
              the privacy practices of these websites. We encourage you to read the privacy
              policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Children's Privacy</h2>
            <p className="text-slate-600">
              Our Service is not intended for children under 18 years of age. We do not knowingly
              collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Changes to This Policy</h2>
            <p className="text-slate-600">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last Updated"
              date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-slate-600 mt-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:info@knowleapstrategies.com" className="text-indigo-600 hover:text-indigo-500">
                info@knowleapstrategies.com
              </a>
            </p>
            <p className="text-slate-600">
              <strong>Mail:</strong> 1785 S King St Suite 3, Honolulu, HI 96826, USA
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
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
