# Ekotone Festival Schedule Page — Design Spec

**Date:** 2026-04-15  
**Project:** PRIMITIV Discord Bot / Dashboard  
**Scope:** Public festival schedule page + admin management UI

---

## Context

PRIMITIV organizes Ekotone, an electronic music festival at the end of May (~350 attendees). The biggest communication pain point is external: attendees need a single place to see the set schedule during the event. Instagram is the current primary channel but is not suited for a live, scannable schedule.

This feature extends the existing Next.js 16 dashboard with:
1. A **public schedule page** at `/schedule` — no authentication, mobile-first, shows set times per stage
2. An **admin schedule management UI** at `/primitiv/schedule-handler` — protected by existing auth, CRUD for slots
3. Existing dashboard routes renamed: `/dashboard/demandes` → `/primitiv/demande`, `/dashboard/paiements` → `/primitiv/paiements`

---

## Data Model

New Prisma model added to `dashboard/prisma/schema.prisma` (and kept in sync with `bot/prisma/schema.prisma`):

```prisma
model Slot {
  id         String   @id @default(cuid())
  stage      Stage    @default(MAIN)
  day        Day
  startTime  DateTime
  endTime    DateTime
  artistName String
  note       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum Day {
  FRIDAY
  SATURDAY
  SUNDAY
}

enum Stage {
  MAIN
  AFTER
}
```

---

## API Routes

**`app/api/schedule/route.ts`**
- `GET` — returns all slots ordered by `startTime`, no auth required
- `POST` — creates a slot, requires auth

**`app/api/schedule/[id]/route.ts`**
- `PUT` — updates a slot, requires auth
- `DELETE` — deletes a slot, requires auth

---

## Public Page — `/schedule`

**Audience:** Festival attendees on mobile  
**Access:** No authentication  
**Design constraints:** Artistic, festival-grade visual identity. Dark aesthetic fitting the electronic music world. Readable in low light on mobile. Fast to load.

**Implementation note:** The public page uses a **fully custom UI** — no Shadcn components. Tailwind CSS is fine for utility classes but the visual design must feel unique and high-quality. The `frontend-design` skill will be used to design and implement this page.

### Layout

- Header: PRIMITIV / Ekotone branding, festival dates — strong typographic treatment
- Day selector: **Friday** | **Saturday** | **Sunday** — custom styled, not a default tab component
- Stage toggle: **Main Stage** | **After** — within the selected day
- Schedule list: chronological slots for selected day + stage
  - Each slot: time range, artist name (prominent), optional genre/note
  - **Now playing** highlight: slot matching current device time is visually distinct
- Overall mood: dark background, bold typography, appropriate for a rave/festival context

---

## Admin Page — `/primitiv/schedule-handler`

**Audience:** PRIMITIV team members  
**Access:** Existing dashboard auth  

### Layout

- Table listing all slots (all days + stages), sortable by day then start time
- "Add slot" button → inline form or modal: day selector, stage selector, start time, end time, artist name, optional note
- Edit / delete per row
- Uses existing Shadcn table + form components (admin UI keeps the standard dashboard look)

---

## Out of Scope

- Ticket purchase integration
- Practical info section (address, transport) — can be added later
- Artist bios or photos

---

## Verification

1. Run `npm run dev` in `dashboard/` — confirm `/schedule` is accessible without login
2. Log into dashboard, go to `/primitiv/schedule-handler`, add a slot → confirm it appears on the public page
3. Set a slot's time to include the current time → confirm "now playing" highlight appears
4. Test on mobile viewport — confirm readability and stage toggle work
5. Run `npm run prisma:migrate` — confirm `Slot` table is created cleanly
