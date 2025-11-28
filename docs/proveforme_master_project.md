1. Where ProveForMe stands right now

From the backup:

Frontend is a Next app with:

A proper login page that calls POST ${API_BASE}/api/v1/users/login, stores pfm_token, pfm_user, and pfm_role in localStorage, and redirects by role to /investor or /bg.

A guard on the login page that auto redirects already logged in users away from /login to /investor or /bg, so they should not see the login screen repeatedly as long as the token and user are valid.

An investor dashboard at /investor that:

Reads pfm_token and pfm_user from localStorage

Redirects to /login if missing or if role is not INVESTOR

Calls GET ${API_BASE}/api/v1/projects with Authorization: Bearer <token> and renders “Your projects,” including card layouts with pay per visit and status.

A global authed header (AuthedHeader) wired into the investor dashboard shell.

API_BASE is already centralized as
process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
and used by login and projects fetches.

The homepage marketing copy and layout already tell the story:

“Local eyes for remote investors”

“Connect Investors with Boots on the Ground”

Explains pay per visit, Provers, visit photos, timestamps, etc.

Global styling has been simplified to light mode only, with CSS like:

:root {
  --background: #ffffff;
  --foreground: #171717;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}


so we are no longer juggling dark mode complexity.

You already pushed these changes to proveforme-frontend and saw a clean git status.

Backend wise, from your repo listing:

You have a Node backend with src/server.ts, src/users.ts, src/projects.ts, src/visits.ts, etc, plus Prisma in prisma/.

There is a loginUser already implemented in users.ts, and all the usual pieces for projects and visits are present.

So the current state is:

ProveForMe has working auth flows on the frontend, a guarded investor dashboard, and a basically structured backend. The main work ahead is polishing the API contracts, wiring more features, and cleaning the UX, not starting over.

Good. That is a solid V0.

2. Unified “ProveForMe Master Project File”

Here is a single document you can save as something like
docs/proveforme_master_project.md in either the frontend or backend repo and refer to as the “source of truth”.

You can copy paste this straight into a file.

ProveForMe - Master Project Blueprint (v1)

Working title: ProveForMe
Tagline: Local eyes for remote investors

ProveForMe is a commission based platform that connects remote real estate investors with trusted local “Boots on the Ground” (Provers) who verify properties through on site visits, photos, videos, and structured reports.

Core roles

Investor

Creates projects and sets pay per visit

Assigns or invites local Provers

Reviews visit photos, timestamps, notes, and status

BG / Prover

Accepts visits

Goes on site and collects evidence

Uploads photos and status updates

Admin (future)

Handles disputes, approvals, escalations

Manages platform wide settings and fees

Key entities

User

id, email, passwordHash

role: INVESTOR or BG

profile info: firstName, lastName, markets, etc

Project

id, investorId

title, description

address: city, state, zip

payPerVisit

status: DRAFT, OPEN, IN_PROGRESS, COMPLETE, ARCHIVED

createdAt, updatedAt

Visit

id, projectId, proverId

scheduledAt, completedAt

status: REQUESTED, ACCEPTED, COMPLETED, CANCELLED

payAtCompletion

notes

Photo / Evidence

id, visitId

filePath or URL (stored under uploads/)

caption, createdAt

Interest

id, projectId, proverId

indicates “I am interested in this project” before formal assignment

Exact Prisma fields live in prisma/schema.prisma, but this is the conceptual map.

Architecture overview

Frontend

Next.js app

LocalStorage based auth, using:

pfm_token (JWT or similar)

pfm_user (serialized user with role)

pfm_role (INVESTOR or BG)

Pages:

/ public marketing homepage

/login login with redirect if already authed

/register registration (investor and BG options)

/investor investor dashboard

/investor/projects/create create project screen

/bg BG dashboard (to be fleshed out more)

Backend

Node with Express (or similar) in src/server.ts

Modules:

users.ts - register, login, maybe getCurrentUser

projects.ts - list, create, update projects

visits.ts, visitStatus.ts, visitViews.ts - visit workflow

photos.ts - upload and listing photos

interest.ts - express interest in a project

db/ - Prisma client and helpers

Communication

Base URL configured by NEXT_PUBLIC_API_BASE_URL on the frontend, defaulting to http://localhost:4000.

Typical pattern:

Login: POST ${API_BASE}/api/v1/users/login

Projects: GET ${API_BASE}/api/v1/projects with Authorization: Bearer <token>

Current frontend behavior

Login page

Automatically checks localStorage on mount.

If token and user exist, and role is INVESTOR, redirect to /investor. If BG, redirect to /bg. If role is unknown, clear storage and let them log in again.

On submit:

POSTs email and password to ${API_BASE}/api/v1/users/login

Expects { ok, token, user }

Stores pfm_token, pfm_user, pfm_role

Redirects by role.

Investor dashboard /investor

Guards the route:

Reads pfm_token and pfm_user from localStorage

If missing or incorrect role, redirect to /login

Fetches projects with GET ${API_BASE}/api/v1/projects and an Authorization header, then renders:

“You have no projects yet…” if empty

Cards showing title, description, city, state, pay per visit, status when present.

Homepage /

Displays ProveForMe brand, tagline, navigation, and call to actions:

“Become a member”

“Log in to dashboard”

A line that says “You are logged in as [name] (Investor). Go to your dashboard.” for already logged in users, which we might wire up as a real link.

Styling

Global CSS uses a simple light theme with CSS variables for background and foreground, and the layout relies on Tailwind classes in the React components. Dark mode is intentionally removed for now to reduce visual bugs.

Known issues and polish items

Homepage “Go to your dashboard” text is not clickable

It currently reads like a link but is plain text. Should be a real Link to /investor or /bg depending on role.

Perceived “have to log in again” issue

The code already tries to short circuit repeated logins, but the UX still shows “Log in / Register” menu items on the homepage even when logged in, which feels inconsistent.

This is mostly a navigation and messaging issue, not core auth.

Backend status on homepage says “checking…”

There is a backend status checker, but you saw “Backend status: checking…” lingering, which suggests either the health endpoint or frontend handling is not fully wired.

Global light theme is done, but some colors were tuned reactively

Colors on certain text were fixed through trial and error. At some point we may unify a design token approach, but functionally it works.

Priority roadmap from here

This is the part that answers “what do I do next” in a very literal way.

Phase 1 - Clean UX and state

Make the “Go to your dashboard” text on the homepage an actual link:

If pfm_role === "INVESTOR", link to /investor

If pfm_role === "BG", link to /bg

Hide this block entirely if not logged in

Make the nav role aware:

If logged out: show “Log in” and “Register”

If logged in:

Show “Member dashboard” that points to correct dashboard

Show “Logout” that clears localStorage and reloads to /

Confirm backend health endpoint:

Implement GET /api/v1/health on the backend

Update the frontend status checker to hit ${API_BASE}/api/v1/health

Show green “Backend online” when it returns ok

Phase 2 - BG / Prover experience

Implement /bg dashboard similar to /investor:

List visits assigned to that BG

Show status, pay, and “Upload photos” button

Build the visit creation path:

After an investor creates a project, allow them to “Request a visit”

Backend: POST /api/v1/projects/:projectId/visits or POST /api/v1/visits

Wire photo upload:

Backend: POST /api/v1/photos with multipart form

Frontend: simple upload component on the BG visit detail screen

Phase 3 - Payments and trust layers

Define fee structure:

Platform fee per visit

Minimum and maximum pay per visit

Maybe a “per market” configuration

Add ratings:

Investors rate Provers after completed visits

Later, display ratings as part of BG profiles

Ground rules for future changes

When we keep iterating, we will follow these rules so the project stays coherent:

Any new route or API must be added to this file:

Add it under a section like “Backend endpoints” or “Frontend routes”

Example:

POST /api/v1/projects/:id/visits - create visit for a project

GET /api/v1/visits/my - list visits for logged in BG

Any major UX pattern (like auth guard, redirect behavior, or state storage keys) must be noted here so we never have to reconstruct it from chat again.

When we cut features, mark them as “deprecated” here instead of silently deleting them from memory.

