# CLAUDE.md — ProveForMe Frontend

## Project Overview
ProveForMe connects remote real estate investors with local "Boots on the Ground" (BG) professionals who conduct property visits, capture photos/videos, and provide documentation. This is the Next.js frontend; the backend is a separate Node.js API.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (utility-first, no component library)
- **Payments**: Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Deployment**: Vercel (auto-deploys from `main` branch)
- **Backend**: Separate API at `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4000`)

## Project Structure
```
app/                    # Next.js App Router pages
  layout.tsx            # Root layout (metadata, fonts)
  page.tsx              # Homepage (role-aware landing)
  login/                # Auth pages (light theme)
  register/
  forgot-password/
  reset-password/
  verify-email/
  account/              # User profile & settings
  investor/             # Investor dashboard + projects
    projects/create/
    projects/[id]/
  bg/                   # BG dashboard + onboarding
    onboard/
  admin/                # Admin dashboard + management
    users/
    projects/
    payments/
    visits/
  visits/[visitId]/     # Visit detail + photo gallery
  about/  support/  terms/  privacy/  training/  sitemap-page/
components/
  AuthedHeader.tsx      # Shared header with role-based navigation
  StripeProvider.tsx     # Stripe Elements wrapper
```

## Key Conventions

### All pages are "use client"
Every page component uses client-side rendering. There are no server components beyond the root layout.

### Authentication
- Token-based auth stored in **localStorage** (not cookies):
  - `pfm_token` — JWT bearer token
  - `pfm_user` — JSON string `{ id, email, firstName, lastName, role }`
  - `pfm_role` — `"INVESTOR"` | `"BG"` | `"ADMIN"`
- Auth guard pattern used on protected pages:
  ```tsx
  useEffect(() => {
    const token = localStorage.getItem("pfm_token");
    const role = localStorage.getItem("pfm_role");
    if (!token || role !== "INVESTOR") router.replace("/login");
  }, [router]);
  ```
- API calls use `Authorization: Bearer ${token}` header

### Three user roles
- **INVESTOR** — creates projects, funds BGs, reviews visit documentation
- **BG** (Boots on the Ground) — conducts property visits, uploads photos
- **ADMIN** — manages users, projects, payments, visits

### API pattern
```tsx
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
// All endpoints: ${API_BASE}/api/v1/...
```
API responses typically use `{ ok: boolean, error?: string, ...data }` envelope.

### Styling
- **Primary color**: `#0066FF` (buttons, links, accents)
- **Hover color**: `#0052CC`
- **Light theme throughout** — white backgrounds, slate/gray text
- Error alerts: `border-red-300 bg-red-50 text-red-800`
- Success alerts: `border-green-300 bg-green-50 text-green-700`
- Status badges use colored pills: `rounded-full px-2 py-0.5 text-[10px] font-medium`
- Font sizes: mostly `text-xs` and `text-sm`; labels often `text-[10px]` uppercase tracking

### Page title pattern
Every page sets its browser tab title on mount:
```tsx
useEffect(() => { document.title = "Page Name \u2014 ProveForMe"; }, []);
```

### Error handling
- `try/catch` around all API calls and JSON parsing
- User-friendly error messages displayed in styled alert divs
- Console errors logged for debugging
- Loading states with disabled buttons (`disabled:opacity-60 disabled:cursor-not-allowed`)

## Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` — backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint check

## Deployment
Push to `main` triggers Vercel auto-deploy. Changes are typically live within 60 seconds. Users may need hard refresh (Ctrl+Shift+R) or incognito to bypass cache.
