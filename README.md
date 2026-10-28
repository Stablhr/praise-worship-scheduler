# UCJM Praise & Worship Ministry App

A mobile app for the praise and worship ministry team of **Unity in Christ Jesus Ministries (UCJM)**. Every week the team needs to know who is assigned to which role, which songs are in the lineup, and when the next service is — all in one place.

![UCJM Logo](./frontend/public/assets/logo.png)

---

## Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript 5, TailwindCSS v4, shadcn/ui, TanStack Query v5, Axios
- **Backend:** Express.js, Mongoose (MongoDB), jsonwebtoken, bcrypt, Zod, Nodemailer, Pino
- **Mobile wrapper:** Capacitor (Android and iPhone from a single codebase)
- **Runtime:** Node.js 18+

## Project Structure

```
frontend/          # Next.js App Router frontend (port 3000)
backend/           # Express.js API (port 5000)
```

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npm run seed:admin     # seed the first admin account
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

Then open http://localhost:3000

## Branding

The church logo is used across the app:

- **Splash screen** — large centered logo on launch
- **Top bar** — logo on the Home screen header
- **Login screen** — logo above the sign-in form
- **Browser tab / favicon** — logo as the site icon
- **Email templates** — logo at the top of verification and password-reset emails

To use your own logo, place a PNG file at `frontend/public/assets/logo.png`. The `BrandLogo` component automatically falls back to a "UCJM" monogram if the file is missing.

Brand colors (from `frontend/app/globals.css`):

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--primary` | `#0B3D91` | `#4C82F7` | Headers, main buttons |
| `--accent` | `#FFC73A` | `#FFC73A` | Highlights, active state |
| `--bg` | `#F4F7FD` | `#0A1020` | Screen background |

## Docs

- `CONTEXT.md` — what we're building, for whom, and why
- `DESIGN.md` — visual and interaction spec (mobile first at 390 px)
- `PLAN.md` — build plan, phases, and data models
- `docs/CUSTOMIZE.md` — fill in your project values to customize everything

## Commands

**Backend:**
- `npm run dev` — Start dev server (port 5000)
- `npm run build` — Compile TypeScript
- `npm run start` — Start production server
- `npm run seed:admin` — Seed admin account
- `npm run lint` — ESLint
- `npm test` — Jest

**Frontend:**
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — ESLint

## Security

- Never commit `.env` files — only `.env.example` is tracked
- Passwords are bcrypt-hashed before storage
- Cookies use HTTP-only, Secure, SameSite
- All input passes through Zod validation

## License

MIT