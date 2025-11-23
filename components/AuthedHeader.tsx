"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "INVESTOR" | "BG" | null;

type AuthedHeaderProps = {
  role: UserRole;
};

export function AuthedHeader({ role }: AuthedHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pfm_token");
      localStorage.removeItem("pfm_user");
      localStorage.removeItem("pfm_role");
    }
    router.push("/login");
  }

  const navItems = [
    { href: "/", label: "Home" },
    role === "INVESTOR"
      ? { href: "/investor", label: "Investor dashboard" }
      : null,
    role === "BG" ? { href: "/bg", label: "BG dashboard" } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/pfm-logo.png"
              alt="ProveForMe logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-50">ProveForMe</p>
            <p className="text-[10px] text-slate-400">
              Local eyes for remote investors.
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-xs md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
          {isClient && (
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:border-slate-400"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-700 p-1 text-slate-200 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-slate-200" />
            <span className="block h-0.5 w-4 bg-slate-200" />
            <span className="block h-0.5 w-4 bg-slate-200" />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === item.href
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}
            {isClient && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-max rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:border-slate-400"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
