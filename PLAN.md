# PLAN.md: UCJM Worship Team App

Read `CONTEXT.md` first and `DESIGN.md` for the look. This file is the build plan.

Work **one phase at a time**. At the end of each phase: run the app, run lint and build, fix errors, then summarize what changed and stop for the owner's review.

---

## 0. Before writing any code

1. Open the existing project folder and list its structure.
2. Read the existing login page, the Express server entry file, the MongoDB connection and any auth code.
3. Note: Is it TypeScript or JavaScript? Which Next.js router (App Router or Pages)? Is Tailwind installed? Which package manager?
4. **Follow what already exists.** Do not change language, router or package manager. Do not rewrite code that already works.
5. Write a short "Findings" note at the top of your first reply.

---

## 1. Suggested structure

Adapt to the existing folders. This is the target shape:

```
/client            (Next.js)
  /app or /pages
    /login
    /(app)
      /dashboard   (Home)
      /schedule
      /lineups
      /members
      /more
      /notifications
      /settings
  /components      (BottomNav, TopBar, Cards, Tags, Avatar, Modals...)
  /lib             (api client, auth helpers, date helpers)
  capacitor.config.*
/server            (Express)
  /models          (Member, Service, Assignment, Lineup, Notification, Settings)
  /routes
  /middleware      (auth, permissions)
  /jobs            (reminder scheduler)
  /uploads         (photos, git-ignored)
```

---

## 2. Data models (MongoDB / Mongoose)

**Member**
- `name`, `email` (unique), `photoUrl`
- `passwordHash` (null until the member sets their own password on first sign-in), `activatedAt`
- `permission`: `admin` | `songleader` | `member`
- `position` (optional label such as Chairman, Pastor, Guitarist)
- `pushTokens` (array), `createdAt`

**Service**
- `type`: `saturday` | `sunday`
- `date` (UTC), `time` label, `notes` (optional)
- `photoUrl` (the pasted photo of assigned volunteers)
  - Phase 3 stores `date` as the exact start instant in UTC and `time` as the Manila start (HH:mm). The app sends a Manila day and time; the server does the conversion.

**Assignment**
- `serviceId`, `role`, `memberId`
- Roles for Sunday: Song leader, Guitarist, Bassist, Drummer, Preacher
- Roles for Saturday: Exhortation, Songlead, Guitarist, Moderator/Host
- One member can hold more than one role in a service. A role can hold more than one member only if it is a repeatable role (Guitarist); keep it to one by default.
  - Phase 3 ships one member per role. Allowing more than one member in the repeatable Guitarist role is deferred until the team asks for it, so nothing the app cannot show can be stored by accident.

**Lineup**
- `serviceId`
- `songs`: array of `{ _id, title, link, type: "praise" | "worship", order, addedBy }`
- No maximum length.

**Notification**
- `memberId` (or `all`), `kind` (reminder, lineup, assignment, schedule), `title`, `body`, `serviceId`, `readAt`, `createdAt`

**Settings**
- Service default times, reminder days and time, role lists (default values from `CONTEXT.md`)

---

## 3. API outline

All routes require a signed-in member unless noted. Return JSON. Validate input.

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /api/auth/member/register` | public | First sign-in of an added member: set their name and password, return session |
| `POST /api/auth/member/login` | public | Sign in with email and password |
| `POST /api/auth/logout` | member | End the session |
| `POST /api/auth/refresh` | public | Refresh the session cookies |
| `GET /api/me` | member | Current member |
| `PATCH /api/me` | member | Update own profile and preferences |
| `GET /api/dashboard` | member | Next Sunday and next Saturday with assignments, latest updates |
| `GET /api/services?from=&to=` | member | Services for the calendar. `from` and `to` are Manila days (YYYY-MM-DD) |
| `POST /api/services` | admin | Create a service |
| `POST /api/services/generate` | admin | Create the upcoming Saturdays and Sundays (the "generate next 8 weeks" action) |
| `GET /api/services/:id` | member | Service with its roles and the members who hold them (the lineup and photo join it in Phases 4 and 5) |
| `PUT /api/services/:id/assignments` | admin | Set assignments. Replaces the whole set for that service |
| `PATCH /api/services/:id` | admin | Edit a service's day, time, type or notes (added in Phase 3 at the owner's request) |
| `DELETE /api/services/:id` | admin | Remove a service and its assignments (added in Phase 3 at the owner's request) |
| `POST /api/services/:id/photo` | member | Upload the pasted photo |
| `DELETE /api/services/:id/photo` | admin | Remove the photo |
| `GET /api/services/:id/lineup` | member | Songs |
| `POST /api/services/:id/lineup/songs` | songleader, admin | Add a song |
| `PATCH /api/services/:id/lineup/songs/:songId` | songleader, admin | Edit or reorder |
| `DELETE /api/services/:id/lineup/songs/:songId` | songleader, admin | Remove |
| `GET /api/members` | member | List members |
| `POST /api/members` | admin | Add a member by email (they set their own password on first sign-in) |
| `PATCH /api/members/:id` | admin | Edit a member's name, position or permission |
| `DELETE /api/members/:id` | admin | Remove a member |
| `GET /api/notifications` | member | Own notifications |
| `PATCH /api/notifications/:id/read` | member | Mark read |
| `POST /api/push/register` | member | Save a device push token |
| `GET /api/settings` / `PATCH /api/settings` | member / admin | System settings |

Permission checks live in one middleware. Never trust the client for permissions.

---

## 4. Phases

### Phase 1: Login page frontend and app shell
The default login page and backend auth already exist. Build the **frontend** for them.
- [x] Splash screen and login screen exactly as in `DESIGN.md`
- [x] Email and password form wired to `POST /api/auth/member/login`, plus the "First time here?" setup path for an added member
- [x] Error states: email not on the member list, wrong password, network failure
- [x] Protected route wrapper: signed-out users go to login
- [x] App shell: top bar, bottom tab bar (5 tabs), safe-area spacing
- [x] Theme tokens and fonts installed (`DESIGN.md`)
- [x] Removed the auth template's own screens (`app/(public)`, `app/(auth)`, `app/(user)`, `app/(admin)` — its landing page, sign-in, sign-up and dashboards). They were still reachable at `/` and `/sign-in`, and they signed in against the empty `users`/`admins` collections, so the Chairman's member account was always refused. `/` now opens the splash screen, and any other URL shows the app's own not-found screen.

**Done when:** a member can sign in with their email and password on a 390 px screen, land on an empty Home, and move between all five tabs.

### Phase 2: Members and permissions
- [x] Member model, seed with a first admin from `ADMIN_EMAILS`
- [x] Permission middleware (`admin`, `songleader`, `member`)
- [x] Members screen: search, filter by role, member cards
- [x] Add member and remove member (admin only), with confirmation on remove
- [x] Edit a member's name, position or permission (added to Phase 2 at the owner's request; the email stays fixed because it is the sign-in identity)
- [x] Hide admin controls from people who lack permission, and enforce on the server

**Done when:** an admin can add and remove members; a normal member cannot, even by calling the API directly.

### Phase 3: Schedule and assignments
- [x] Service and Assignment models
- [x] Monthly calendar with dots on service days
- [x] Service details screen listing every role and who holds it
- [x] Admin: create services, assign and change volunteers
- [x] Admin: create the upcoming Saturdays and Sundays quickly (a "generate next 8 weeks" action)
- [x] Admin: edit a service's day, time or notes, and remove a service (added in Phase 3 at the owner's request; see section 3)

**Done when:** an admin can assign every role for next Saturday and Sunday, and members can see it.

### Phase 4: Lineups
- [ ] Lineup model with unlimited songs
- [ ] Lineups screen: This Weekend and All Lineups tabs
- [ ] Add, edit, delete and reorder songs
- [ ] Praise/Fast and Worship/Slow label on every song
- [ ] Link button opens the song link
- [ ] Only song leaders and admins see edit controls

**Done when:** a song leader can add 10 songs to one Sunday and everyone can see them in order with correct labels.

### Phase 5: Dashboard and photo paste
- [ ] Dashboard: greeting, Next Service card, Upcoming Assignments rows, latest updates
- [ ] Photo paste: paste an image from the clipboard on the service screen, preview, upload
- [ ] Gallery picker button as a fallback for phones
- [ ] Compress images on the client before upload (max about 1600 px wide)
- [ ] Show the photo on the dashboard and service screen

**Done when:** pasting a photo attaches it to the service and everyone sees it.

### Phase 6: Notifications
- [ ] Notification model and in-app Notifications screen
- [ ] Scheduled job that creates and sends reminders 3 and 2 days before each service
- [ ] Notifications when a lineup changes or an assignment changes
- [ ] Push notifications through Capacitor (FCM for Android, APNs for iPhone)
- [ ] Unread badge on the bell

**Done when:** a test service dated 3 days ahead triggers a reminder to every member.

### Phase 7: Settings
- [ ] Profile: name, photo, sign out
- [ ] App settings: notifications on/off, Appearance (Light, Dark, System), Language (English)
- [ ] System settings (admin): default service times, reminder timing, About App, Help and Support

**Done when:** changes persist and the theme switches live.

### Phase 8: Capacitor and polish
- [ ] Add Capacitor, configure Android and iOS projects
- [ ] App icon and splash from the church logo
- [ ] Safe areas, status bar color, back button behavior on Android
- [ ] Loading, empty and error states on every screen
- [ ] Accessibility pass (contrast, tap targets of at least 44 px, labels)
- [ ] README with setup, env variables, and build steps

**Done when:** the app runs on an Android device or emulator and every core flow works.

---

## 5. Testing checklist

- Sign in works for an added member and is refused for an unknown email.
- A normal member cannot call admin or song leader endpoints.
- A lineup accepts more than 4 songs.
- Pasted photo uploads and displays.
- Reminder job creates exactly one reminder per member per window (no duplicates on restart).
- Dates show correctly in Asia/Manila.
- Layout holds at 360, 390 and 430 px widths.

---

## 6. Do not

- Do not rewrite the existing login backend or database connection.
- Do not add a song limit.
- Do not add a multimedia role.
- Do not bring back the template's own screens or its landing page. Every screen lives under `app/(app)/`; `/` opens the splash.
- Do not build store-publishing steps or a PWA manifest as the main install path.
- Do not skip a phase's "Done when" check.
