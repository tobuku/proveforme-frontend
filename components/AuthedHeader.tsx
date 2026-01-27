"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "INVESTOR" | "BG" | null;

type AuthedHeaderProps = {
  /**
   * Optional role passed in from a page that already knows the user role.
   * If not provided, the header will fall back to reading pfm_role itself.
   */
  role?: UserRole;
};

export function AuthedHeader({ role: propRole }: AuthedHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole>(propRole ?? null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep internal role in sync with propRole or localStorage
  useEffect(() => {
    try {
      if (propRole) {
        setRole(propRole);
        return;
      }

      if (typeof window === "undefined") return;

      const storedRole = localStorage.getItem("pfm_role");
      if (storedRole === "INVESTOR" || storedRole === "BG") {
        setRole(storedRole);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("Error reading role from storage in AuthedHeader", err);
      setRole(null);
    }
  }, [propRole]);

  function handleLogout() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("pfm_token");
        localStorage.removeItem("pfm_user");
        localStorage.removeItem("pfm_role");
      }
    } catch (err) {
      console.error("Error clearing auth storage on logout", err);
    }
    router.push("/login");
  }

  const navItems: { href: string; label: string }[] = [
    { href: "/", label: "Home" },
  ];

  if (role === "INVESTOR") {
    navItems.push({ href: "/investor", label: "Investor dashboard" });
    navItems.push({ href: "/account", label: "My Account" });
  } else if (role === "BG") {
    navItems.push({ href: "/bg", label: "BG dashboard" });
    navItems.push({ href: "/account", label: "My Account" });
  } else {
    navItems.push({ href: "/login", label: "Log in" });
    navItems.push({ href: "/register", label: "Register" });
  }

  const showLogout = role === "INVESTOR" || role === "BG";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
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
            <p className="text-sm font-semibold text-slate-900">
              ProveForMe
            </p>
            <p className="text-[10px] text-slate-500">
              Local eyes for remote investors.
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 text-xs md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }
            >
              {item.label}
            </Link>
          ))}

          {showLogout && (
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-1 text-slate-700 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-slate-800" />
            <span className="block h-0.5 w-4 bg-slate-800" />
            <span className="block h-0.5 w-4 bg-slate-800" />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === item.href
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                }
              >
                {item.label}
              </Link>
            ))}

            {showLogout && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-max rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
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
