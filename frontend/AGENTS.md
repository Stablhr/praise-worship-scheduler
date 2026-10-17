# Frontend AGENTS.md

## Stack

Next.js 16 App Router, React 19, TypeScript 5, TailwindCSS v4, shadcn/ui, TanStack Query v5, Axios

## Commands

```bash
cd frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint
```

## Architecture

```
app/page.tsx        # Sends / to the splash screen
app/(app)/          # The UCJM app
  splash/           # Splash, then Home or Login (DESIGN.md 6.1)
  login/            # Email + password sign-in and "First time here?" setup (6.2)
  (shell)/          # Protected shell: RequireAuth + bottom nav
    home/ schedule/ lineups/ members/ more/
components/app/     # App UI (cards, sheets, nav, form fields, states)
components/auth/    # RequireAuth
components/ui/      # shadcn/ui primitives
lib/api/            # Axios HTTP client, auth/members/services APIs, error mapping
lib/hooks/          # React Query hooks (auth, members, schedule)
lib/date/ lib/schedule/ lib/members/ lib/validation/
lib/provider/       # ReactQueryProvider
```

The auth boilerplate this project started from (`(public)`, `(auth)`, `(user)`,
`(admin)` — landing page, sign-in/sign-up, user and admin dashboards) has been
removed. Do not bring it back; every screen belongs under `app/(app)/`.

## Code Style

- TypeScript strict mode — no `any` types in new code
- Frontend errors go through `getFriendlyErrorMessage()` — never show raw backend messages to users
- React Query hooks in `frontend/lib/hooks/` for all server state
- Use shadcn/ui components from `frontend/components/ui/` — never build form inputs or modals from scratch
- API calls live in `frontend/lib/api/` (`authApi.ts`, `membersApi.ts`, `servicesApi.ts`) — keep them centralized there

## Error Handling

All API errors are normalized through `frontend/lib/api/httpClient.ts` into this shape:

```ts
type NormalizedApiError = {
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
};
```

The `getFriendlyErrorMessage()` function maps error codes to user-friendly messages. If a new error code is added on the backend, add a mapping here too.

## Route Groups

- `(app)` — No auth required for `splash` and `login`; the `(shell)` group wraps every signed-in screen in `RequireAuth`, which sends signed-out visitors to `/login`.
- Screens are mobile first (390 px), with the Netflix-style bottom nav from DESIGN.md section 5.

## Security Rules

- Never commit `.env` files — only `.env.example` is tracked
- Never log tokens, passwords, or secrets
- All API requests go through `httpClient.ts` (handles auth, refresh, error normalization)
- Do not store tokens in localStorage — cookies are managed by the backend
