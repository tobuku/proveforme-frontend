"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "INVESTOR" | "BG" | null;
type Theme = "light" | "dark";

type AuthedHeaderProps = {
  /**
   * Optional role passed in from a page that already knows the user role.
   * If not provided, the header will fall back to reading pfm_role itself.
   */
  role?: UserRole;
};

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");

  // Load initial theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("pfm_theme") as Theme | null;

      let initial: Theme = "light";

      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        initial = "dark";
      }

      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch (err) {
      console.error("Error loading theme from storage", err);
    }
  }, []);

  function updateTheme(next: Theme) {
    setTheme(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pfm_theme", next);
        document.documentElement.setAttribute("data-theme", next);
      } catch (err) {
        console.error("Error saving theme to storage", err);
      }
    }
  }

  return [theme, updateTheme];
}

export function AuthedHeader({ role: propRole }: AuthedHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole>(propRole ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useTheme();

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
  } else if (role === "BG") {
    navItems.push({ href: "/bg", label: "BG dashboard" });
  } else {
    navItems.push({ href: "/login", label: "Log in" });
    navItems.push({ href: "/register", label: "Register" });
  }

  const showLogout = role === "INVESTOR" || role === "BG";

  const themeLabel = theme === "light" ? "Dark mode" : "Light mode";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
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
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              ProveForMe
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
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
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-400"
          >
            {themeLabel}
          </button>

          {showLogout && (
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-400"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-1 text-slate-700 dark:border-slate-700 dark:text-slate-200 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-slate-800 dark:bg-slate-200" />
            <span className="block h-0.5 w-4 bg-slate-800 dark:bg-slate-200" />
            <span className="block h-0.5 w-4 bg-slate-800 dark:bg-slate-200" />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === item.href
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setTheme(theme === "light" ? "dark" : "light");
              }}
              className="mt-2 w-max rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-400"
            >
              {themeLabel}
            </button>

            {showLogout && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-max rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-400"
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
