# CONTEXT.md: UCJM Worship Team App

Read this file first. It explains what we are building, for whom, and why. `PLAN.md` says how to build it. `DESIGN.md` says how it must look.

---

## 1. What this project is

A mobile app for the praise and worship ministry team of **Unity in Christ Jesus Ministries (UCJM)**.

Every week the team needs to know:
- who is assigned to which role for the Saturday prayer meeting and the Sunday service,
- which songs are in the lineup,
- when the next service is.

The app puts all of that in one place and reminds everyone 2-3 days before each service.

The app must be an **official installable app** (Android and iPhone), not a PWA. We build it as a Next.js web app and wrap it with **Capacitor**, from a single codebase.

---

## 2. Who uses it

| Person | What they can do |
| --- | --- |
| **Chairman** and **Pastor** | Admins. Assign volunteers to roles, add new members, remove members, and do everything a song leader can do |
| **Song leader** | Add, edit and remove lineup songs and their links |
| **Every member** | View the dashboard, schedule, assignments, lineups and members. Paste a photo showing the assigned volunteers. Edit their own profile and settings. Receive notifications |

Members sign in with their **email and a password**. An admin has to add the email first.

---

## 3. The two services

### Saturday Prayer Meeting (afternoon)
Roles:
1. Exhortation
2. Songlead
3. Guitarist
4. Moderator/Host

How it runs:
1. The song leader leads a worship song.
2. The guitarist plays the rhythm.
3. Everyone sits, and the moderator/host leads those who want to thank the Lord for the week.
4. The exhortation shares the word of God.

### Sunday Service (morning)
Roles:
1. Song leader
2. Guitarist
3. Bassist
4. Drummer
5. Preacher

How it runs:
1. Praise and worship: singing and dancing before the Lord. The usual pattern is 2 fast songs and 2 worship songs.
2. The preacher shares a lesson, the word of God, or a sermon.

There is **no multimedia role**. It was removed.

---

## 4. Lineups

- A lineup is the set of songs for one service (Saturday or Sunday).
- The song leader (or an admin) adds songs. Each song has a title, an optional link (for example YouTube), and a label: **Praise/Fast** or **Worship/Slow**.
- **There is no limit on the number of songs.** 2 fast + 2 worship is only the usual pattern. During events the team sings more. Never enforce a maximum.
- Songs can be reordered.

---

## 5. Features

1. **Dashboard**: the current update, and who is assigned for the upcoming Sunday (and the upcoming Saturday).
2. **Schedule**: calendar of Saturday prayer meetings and Sunday services.
3. **Assigned**: who holds each role for a given service.
4. **Lineups**: songs per service, labeled Praise/Fast or Worship/Slow, with links.
5. **Photo paste**: copy and paste a photo showing the assigned volunteers. Open to every member. On phones, also offer a button to pick a photo from the gallery, because pasting an image is hard on mobile.
6. **Members**: add and delete members (Chairman and Pastor only).
7. **Settings**: customizable settings, plus profile settings and system settings.
8. **Notifications**: every member is notified 2-3 days before a service. Also notify when a lineup is added or updated and when an assignment changes.

---

## 6. Tech stack

- **Frontend:** Next.js
- **Backend:** Express.js
- **Database:** MongoDB (already connected; user data is stored there)
- **Mobile wrapper:** Capacitor (Android and iPhone from the same Next.js codebase)
- **Auth:** email and password. No Google sign-in. Only emails an admin has added can sign in
- **Starting point:** a VS Code project folder already exists with a **default login page** and the MongoDB connection. The **login page frontend** is the one piece still missing. Inspect the existing code before changing anything, and do not rewrite working auth or database code.

---

## 7. Design in one paragraph

Blue and yellow brand colors, taken from a mockup the user supplied. Clean, rounded, friendly. The navigation copies the **Netflix mobile app** pattern: a fixed bottom tab bar (Home, Schedule, Lineups, Members, More), a slim top bar with the logo and profile, and swipeable rows of cards on Home. Full details are in `DESIGN.md`.

---

## 8. Decisions already made

- Official app via Capacitor, not a PWA.
- Next.js + Express.js + MongoDB.
- Email and password sign-in (Google sign-in was dropped).
- Chairman and Pastor assign roles and manage members.
- Everyone can paste photos.
- Lineups have no song limit.
- Netflix-style navigation.

---

## 9. Open questions and the defaults to use until answered

| Question | Default to use now |
| --- | --- |
| Name on splash and login screens | Show **UCJM** and "Unity in Christ Jesus Ministries" as the title, with "Praise & Worship Ministry" as the subtitle |
| Light or dark theme | **Light** theme from the mockup. Add an Appearance setting (Light, Dark, System) so dark can be switched on |
| Which phones | Configure Capacitor for **both Android and iPhone**. Test on Android first |
| App stores or direct sharing | Not decided. Do not build store-publishing steps yet |
| Default service times | Saturday 3:00 PM, Sunday 9:00 AM, both editable in Settings |
| Who can sign in | Only emails an admin has added. An added member sets their own password the first time they sign in. The very first admin comes from an `ADMIN_EMAILS` environment variable |
| Reminder timing | One reminder 3 days before and one 2 days before, at 9:00 AM Asia/Manila time, configurable by admins |

If the user answers any of these, update this table.

---

## 10. Ground rules

- Time zone is **Asia/Manila (UTC+08:00)**. Store dates in UTC, display in Asia/Manila.
- Design **mobile first** at 390 px wide, then scale up.
- Keep the code simple and readable. The owner is a student developer who will maintain it.
- Never hard-code secrets. Use `.env` files and provide `.env.example`.
- Use real, sensible sample data in seeds, not lorem ipsum.
- Do not copy Netflix's logo, colors or branding. Copy only the navigation pattern.
