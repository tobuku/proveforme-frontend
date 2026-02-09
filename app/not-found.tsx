import Link from "next/link";

export default function NotFound() {
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
            404
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-slate-600">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex justify-center gap-3 pt-2 text-xs">
            <Link
              href="/"
              className="rounded-md bg-[#0066FF] px-4 py-2 font-semibold text-white hover:bg-[#0052CC]"
            >
              Go home
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:border-slate-400"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
