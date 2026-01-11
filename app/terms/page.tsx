"use client";

import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: January 10, 2025</p>

        <div className="prose prose-slate prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing and using ProveForMe.com ("Service"), you accept and agree to be bound by
              the terms and provisions of this agreement. If you do not agree to these terms, please
              do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
            <p className="text-slate-600">
              ProveForMe.com provides a platform that connects real estate investors with local
              service providers ("Boots on the Ground" or "BGs") who can conduct property visits,
              take photos and videos, and provide documentation services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Platform Fees</h2>
            <p className="text-slate-600">
              ProveForMe charges a <strong>1.5% platform fee</strong> on all transactions processed
              through the platform. This fee is deducted from the payment amount before funds are
              transferred to the BG service provider. By using our payment services, you acknowledge
              and agree to this fee structure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. User Accounts</h2>
            <p className="text-slate-600">
              To use certain features of the Service, you must register for an account. You agree to
              provide accurate, current, and complete information during registration and to update
              such information to keep it accurate, current, and complete. You are responsible for
              safeguarding your password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. User Conduct</h2>
            <p className="text-slate-600 mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use the Service to harass, abuse, or harm another person</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Payment Terms</h2>
            <p className="text-slate-600">
              All payments are processed through Stripe, a third-party payment processor. By using
              our payment features, you also agree to Stripe's terms of service. Funds are held in
              escrow until the investor releases payment after satisfactory completion of the visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-slate-600">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Limitation of Liability</h2>
            <p className="text-slate-600">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROVEFORME SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
              PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Indemnification</h2>
            <p className="text-slate-600">
              You agree to indemnify and hold harmless ProveForMe and its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses
              arising out of your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Modifications to Terms</h2>
            <p className="text-slate-600">
              We reserve the right to modify these Terms at any time. We will notify users of any
              material changes by posting the new Terms on this page. Your continued use of the
              Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Termination</h2>
            <p className="text-slate-600">
              We may terminate or suspend your account and access to the Service immediately,
              without prior notice or liability, for any reason, including breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Governing Law</h2>
            <p className="text-slate-600">
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Hawaii, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Contact Information</h2>
            <p className="text-slate-600">
              If you have any questions about these Terms, please contact us:
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
          <p>&copy; 2025 ProveForMe.com All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
