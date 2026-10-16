# DESIGN.md: UCJM Worship Team App

Read `CONTEXT.md` first. This file is the visual and interaction spec. Everything is **mobile first** at 390 px wide.

Reference: the user's blue and yellow mockup (splash, login, home, schedule, lineups, members, notifications, settings). Match its look. Where this file and the mockup differ, this file wins.

---

## 1. Principles

- Friendly, clean, calm. A church team uses this, so it should feel warm, not corporate.
- Big, readable text and big tap targets.
- One clear thing per screen.
- Content first. Controls only appear for people who are allowed to use them.

---

## 2. Color tokens

Define these as CSS variables and map them in the Tailwind config.

### Light theme (default)
| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#0B3D91` | Headers, main buttons, active icons |
| `--primary-dark` | `#082B66` | Pressed state, gradient end |
| `--accent` | `#FFC73A` | Highlights, active indicator, floating add button |
| `--accent-soft` | `#FFF3CD` | Next Service card, reminder card background |
| `--bg` | `#F4F7FD` | Screen background |
| `--surface` | `#FFFFFF` | Cards, sheets |
| `--text` | `#0F1B3D` | Body text |
| `--muted` | `#6B7280` | Secondary text |
| `--border` | `#E3E8F4` | Dividers and card borders |
| `--success` | `#16A34A` | Success messages |
| `--danger` | `#DC2626` | Remove, log out, errors |

### Song label tags
| Label | Background | Text |
| --- | --- | --- |
| Praise / Fast | `#FFF3CD` | `#8A5A00` |
| Worship / Slow | `#E3ECFF` | `#0B3D91` |

### Dark theme (Settings > Appearance)
| Token | Value |
| --- | --- |
| `--primary` | `#4C82F7` |
| `--primary-dark` | `#2F5FC9` |
| `--accent` | `#FFC73A` |
| `--accent-soft` | `#3A3115` |
| `--bg` | `#0A1020` |
| `--surface` | `#121A2E` |
| `--text` | `#F3F6FF` |
| `--muted` | `#9AA6C0` |
| `--border` | `#243049` |

---

## 3. Typography

Load with `next/font/google`.

- **Headings:** Poppins, weights 600 and 700
- **Body and UI:** Inter, weights 400, 500 and 600

| Style | Size / line height | Font |
| --- | --- | --- |
| Screen title | 20 / 28 | Poppins 600 |
| Section title | 16 / 24 | Poppins 600 |
| Card title | 16 / 22 | Inter 600 |
| Body | 14 / 20 | Inter 400 |
| Caption | 12 / 16 | Inter 400, `--muted` |
| Tab label | 11 / 14 | Inter 500 |

---

## 4. Shape, spacing and effects

- Spacing scale: 4, 8, 12, 16, 24, 32. Screen side padding is 16.
- Cards: radius 16, border 1 px `--border`, shadow `0 2px 8px rgba(11, 61, 145, 0.08)`.
- Buttons: height 48, radius 24 (pill), full width on forms.
- Role tags and song tags: pill, 12 px text, 8 px by 4 px padding.
- Avatars: circle, 40 px in lists, 32 px in the top bar, 72 px on profile.
- Icons: simple line icons (Lucide), 24 px, 1.75 px stroke.
- Motion: 150 to 200 ms ease-out. Cards press down slightly. Tab changes fade. Respect "reduce motion".

---

## 5. Navigation (Netflix mobile app pattern)

Copy the pattern only. Do not copy Netflix's logo, red color or name.

### Bottom tab bar
- Fixed to the bottom, full width, always visible on main screens.
- Five tabs in this order: **Home, Schedule, Lineups, Members, More**.
- Each tab: icon (24 px) above a short label (11 px).
- Active tab: icon and label in `--primary`, bold label, and a short yellow bar (`--accent`, 3 px tall, 24 px wide) above the icon.
- Inactive tabs: `--muted`.
- Height 64 px plus the device bottom safe-area inset.
- Background `--surface` with a 1 px top border.
- Tapping the active tab scrolls that screen to the top.
- Show a small dot on **More** when there are unread notifications.

### Top bar
- Slim, 56 px, blue (`--primary`) on Home, plain on other screens.
- Left: church logo and the name "Praise & Worship Ministry".
- Right: notification bell with unread badge, then the member's round profile photo (opens Settings).
- On inner screens: back arrow on the left, screen title in the center or left, and a contextual action on the right (calendar icon, yellow "+" button).

### Content rows
- Home uses **horizontally swipeable rows of cards**, like Netflix rails. Each row has a section title and cards that peek at the right edge so people know to swipe.
- Vertical scrolling between rows.

---

## 6. Screens

### 6.1 Splash
- White background, church logo centered, large.
- Title "UCJM" in Poppins 700, blue, with "Unity in Christ Jesus Ministries" below.
- Tagline "One Heart · One Voice · His Glory" in small caps, muted.
- Blue and yellow wave at the bottom.
- Show for about 1.2 seconds, then go to Login or Home.

### 6.2 Login (the first piece to build)
- White card area with the same wave at the bottom.
- Logo, "UCJM" title, subtitle "Praise & Worship Ministry".
- Heading "Welcome back!" and one line: "Sign in to see who is serving and what songs are planned."
- One large pill button: **Continue with Google** (Google "G" icon, white button with blue border; or blue button with white text).
- Small text under the button: "Only members added by the Chairman or Pastor can sign in."
- Error banner (red tint) if the email is not on the member list: "This Google account is not on the team list. Please ask the Chairman or Pastor to add you."
- Loading state: button shows a spinner and is disabled.
- No email and password fields. Sign-in is Google only.

### 6.3 Home (Dashboard)
- Blue top bar with logo, bell and profile photo.
- Greeting: "Good morning," then the member's first name, with a short Bible verse line below it in italics. Pick the greeting by time of day.
- **Next Service card** (`--accent-soft` background): calendar icon, "Next Service", service name, date and time, chevron to open details.
- Row: **Upcoming Assignments**. Two swipeable cards: Sunday Service and Saturday Prayer Meeting. Each lists every role with the member's photo, role and name.
- Row: **Latest Updates**: new lineup added, schedule change, assignment change, with relative time.
- If a photo of the volunteers was pasted, show it as a wide card titled "This week's team".

### 6.4 Schedule
- Top bar title "Schedule" with a calendar icon.
- Month header with previous and next arrows.
- Calendar grid. Today is a yellow circle. Days with a service have a small blue dot.
- Below the calendar: a card per upcoming service (name, date, time, chevron).
- **Service Details**: two columns of roles (Sunday and Saturday) with icons.
- Service detail screen: roles with assigned members, the lineup summary, the team photo and the paste/upload area.
- Admins see "Edit assignments".

### 6.5 Lineups
- Top bar title "Lineups". Song leaders and admins see a yellow "+" button.
- Tabs: **This Weekend** and **All Lineups**.
- A card per service (Sunday, Saturday). Expand to show numbered songs.
- Each song row: number circle, title, tag (Praise / Fast or Worship / Slow), duration if known, link icon.
- Link icon opens the link.
- Edit mode (song leader and admin): drag handle, edit, delete.
- "Add song" sheet: title, link, label toggle (Praise/Fast | Worship/Slow).
- Never show a "maximum songs" message.

### 6.6 Members
- Top bar title "Members". Admins see a yellow "+" button.
- Search field, tabs **All Members** and **By Role**.
- Each row: photo, name, a position tag, and a three-dot menu.
- Admins see "Remove member" in the menu, which asks for confirmation.
- "Add member" sheet (admin only): name, Google email, position, permission.

### 6.7 More (Notifications, Settings)
- A simple list: Notifications (with unread count), Settings, Help and Support, Log out (red).

### 6.8 Notifications
- Top bar title "Notifications".
- Empty state: bell illustration, "You're all caught up."
- Cards: reminder (yellow-tinted), new lineup, schedule change. Title, one line of detail, date and time. Unread cards have a blue dot.

### 6.9 Settings
- **Profile:** photo, name, position; tap to edit.
- **App Settings:** Notifications, Appearance (Light, Dark, System), Language (English).
- **System Settings:** About App with version, Help and Support, Log out. Admins also see service times and reminder timing.

---

## 7. Components to build once and reuse

`BottomNav`, `TopBar`, `ScreenHeader`, `Card`, `Row` (horizontal rail), `RoleTag`, `SongTag`, `Avatar`, `MemberRow`, `SongRow`, `ServiceCard`, `AssignmentList`, `CalendarMonth`, `BottomSheet`, `ConfirmDialog`, `EmptyState`, `Skeleton`, `Toast`, `PhotoPaste`.

---

## 8. States every screen needs

- **Loading:** skeleton blocks, not a spinner on a blank page.
- **Empty:** friendly message with an icon and, for allowed people, a button to add the first item.
- **Error:** short message and a Retry button.
- **No permission:** hide the control. Never show a disabled admin button to regular members.

---

## 9. Responsive and device rules

- Design at 390 px. Must also work at 360 and 430 px.
- On wider screens (tablet), center the app in a column of at most 480 px.
- Respect safe-area insets for the notch and home indicator (`env(safe-area-inset-*)`).
- Tap targets at least 44 px.
- Text contrast at least 4.5 to 1.
- Do not rely on color alone: song tags always carry their text label.

---

## 10. Tone of text

Short, warm and plain. Examples: "Good morning," "Next Service," "You're all caught up." Avoid jargon and technical error messages.
