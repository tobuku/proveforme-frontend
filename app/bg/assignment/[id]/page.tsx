"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BgAssignmentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Assignment — ProveForMe";

    const token = localStorage.getItem("pfm_token");
    const role = (localStorage.getItem("pfm_role") || "").toUpperCase();

    if (!token || role !== "BG") {
      router.replace("/login");
      return;
    }

    router.replace("/bg");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
    </div>
  );
}
