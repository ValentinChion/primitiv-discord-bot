# EKOTONE Attendee App — Ideas & Value Ranking

Festival: EKOTONE by PRIMITIV · May 2026 · Paris
Scale: 200–350 attendees · Single venue
Current state: Public `/schedule` page — day/stage filter, "En ce moment" live view, artist cards

---

## Direction: PWA-first attendee hub

Turn the existing `/schedule` page into a full PWA attendee hub. No App Store required — attendees install it from the browser via a QR code at the venue or a link shared before the event. The schedule already exists; the goal is to make it more useful before, during, and after the festival.

---

## Features ordered by attendee value

### 1. PWA foundation — offline + installable
**Value: Critical enabler**

The base layer everything else depends on. Without it, the app is just a webpage that breaks when the venue WiFi gets saturated.

- `manifest.json` — name, icons, theme color, `display: standalone`
- Service worker with a cache-first strategy for the schedule API response and static assets
- "Add to Home Screen" prompt with a custom in-app banner (don't rely on the browser default)
- Offline fallback page if the cache is empty

**Why first:** Connectivity at festivals is notoriously unreliable. 60-70% of attendees actively use festival apps that work offline. This is the single highest-leverage change.

---

### 2. Practical info page
**Value: Very high — reduces pre-event questions flood**

A static page with everything attendees need to know before showing up. This is the #1 question source for any event.

- Venue address + embedded map link (Google Maps / Apple Maps deep link)
- Public transport directions (metro line, bus stop, nearest station)
- Doors opening time, last entry, end time
- What to bring / what NOT to bring (cash, ID, etc.)
- Contact (email or Discord link for questions)
- FAQ (parking, accessibility, cloakroom, re-entry policy)

**Why second:** Pure static content, zero backend work, saves organizers hours of repeated DMs and emails in the week before the event.

---

### 3. Personal lineup / favorites
**Value: High — core engagement loop**

Let attendees build their personal schedule by bookmarking sets. Stored in `localStorage` — no auth, no backend.

- Bookmark icon on each slot card
- "My lineup" tab or filter alongside the day tabs
- Bookmarks persist across sessions (localStorage)
- Optional: export personal schedule as a shareable image (CSS screenshot via `html2canvas`)

**Why third:** Universally the most-used feature in festival apps after the schedule itself. Gives attendees a reason to open the app before the event and return to it throughout.

---

### 4. Set reminders (in-app)
**Value: High — drives return visits and timely attendance**

Since push notifications are unreliable on iOS unless the PWA is installed to home screen, implement a simpler in-app reminder system as the primary path, with push as an opt-in bonus.

- When bookmarking a slot, offer "remind me 15 min before"
- Uses the Web Notifications API (prompt permission once)
- Falls back gracefully if permission denied — just shows a badge on the "En ce moment" tab when something bookmarked is starting
- On Android: full push via service worker
- On iOS: works only if added to home screen, otherwise in-app only

---

### 5. Artist detail pages
**Value: Medium-high — discovery and hype before the festival**

Each artist gets a dedicated page at `/schedule/artist/[slug]` with:

- Full-width header image
- Bio / description (already in the `description` field of the `Slot` model)
- Stage + time
- Links: SoundCloud, Instagram, Bandcamp (add `links` field to `Slot` or store as JSON)
- Share button (Web Share API)

**Why here:** Drives pre-event engagement. Attendees browse artists in the days before, share links, build anticipation. The data is mostly already in the DB (`description`, `imageUrl`).

---

### 6. Schedule progress indicator
**Value: Medium — quality-of-life improvement to existing feature**

Small upgrade to the current slot list:

- Visual time bar showing how far into a set we are (e.g. "32 min in · 28 min left")
- "Up next" hint below the current slot in the "En ce moment" view
- Sticky "now playing" mini-bar at the bottom of the schedule view when scrolling past the current slot

---

### 7. Countdown page / pre-event landing
**Value: Medium — pre-event hype**

A simple countdown page at `/` (or the root of the hub) that shows:

- Days / hours / minutes until the festival opens
- Teaser of the lineup (artist names, no full schedule)
- Link to the full schedule (unlocks closer to the event)
- "Add to Home Screen" prompt

Becomes the main shareable link before the event. After the festival starts, redirects to the schedule.

---

### 8. Discord bot notifications
**Value: Medium — zero new infrastructure**

Leverage the existing Discord bot to post set reminders to a dedicated `#programme` channel:

- "🎵 **Artist X** starts in 10 minutes on Main Stage"
- Attendees who join the Discord get native mobile notifications without any PWA install

Low dev cost since the bot already exists. Complements the PWA path rather than replacing it.

---

### 9. "Share this set" / social sharing
**Value: Low-medium — organic reach**

Web Share API button on each artist card and detail page. Shares a deep link like `ekotone.fr/schedule?day=SATURDAY&artist=xyz`. Works natively on mobile (opens the OS share sheet). Zero backend.

---

### 10. QR code entry / check-in
**Value: Low for this scale**

At 200-350 people with a single entrance, check-in via QR is probably over-engineered. Ticket scanning systems (Shotgun, Eventbrite, etc.) already handle this better than a custom solution.

**Verdict: Skip unless ticketing is fully in-house.**

---

### 11. Live social feed / attendee posts
**Value: Low for intimate festival**

Photo walls, attendee check-ins, social features — these shine at 5,000+ person festivals where you don't know anyone. At EKOTONE's scale, everyone knows each other and the Discord already serves this role.

**Verdict: Skip.**

---

## Implementation order recommendation

1. PWA foundation (manifest + service worker + offline)
2. Practical info page
3. Personal lineup + reminders
4. Artist detail pages
5. Schedule quality-of-life improvements
6. Countdown landing page
7. Discord bot notifications

Each step is independently shippable and valuable. Stop at any point and the app is better than before.
