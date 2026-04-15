# Ekotone Festival Schedule Page — Design Spec

**Date:** 2026-04-15  
**Project:** PRIMITIV Discord Bot / Dashboard  
**Scope:** Public festival schedule page + admin management UI

---

## Context

PRIMITIV organizes Ekotone, an electronic music festival at the end of May (~350 attendees). The biggest communication pain point is external: attendees need a single place to see the set schedule during the event. Instagram is the current primary channel but is not suited for a live, scannable schedule.

This feature extends the existing Next.js 16 dashboard with:
1. A **public schedule page** at `/ekotone` — no authentication, mobile-first, shows set times per stage
2. An **admin management UI** at `/dashboard/ekotone` — protected by existing auth, CRUD for slots

---

## Data Model

New Prisma model added to `dashboard/prisma/schema.prisma` (and kept in sync with `bot/prisma/schema.prisma`):

```prisma
model Slot {
  id         String   @id @default(cuid())
  stage      Stage    @default(MAIN)
  startTime  DateTime
  endTime    DateTime
  artistName String
  note       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum Stage {
  MAIN
  AFTER
}
```

---

## API Routes

**`app/api/ekotone/route.ts`**
- `GET` — returns all slots ordered by `startTime`, no auth required
- `POST` — creates a slot, requires auth

**`app/api/ekotone/[id]/route.ts`**
- `PUT` — updates a slot, requires auth
- `DELETE` — deletes a slot, requires auth

---

## Public Page — `/ekotone`

**Audience:** Festival attendees on mobile  
**Access:** No authentication  
**Design constraints:** Readable in low light, fast to load, works offline once loaded

### Layout

- Header: PRIMITIV / Ekotone branding, festival date
- Stage toggle: **Main Stage** | **After** (tab or segmented control)
- Schedule list: chronological slots for selected stage
  - Each slot: time range (e.g. `22:00 — 23:30`), artist name (large), optional note/genre tag (small)
  - **Now playing** highlight: slot whose time window contains the current time is visually highlighted (computed client-side from device clock)
- Built with existing Shadcn + Tailwind stack

---

## Admin Page — `/dashboard/ekotone`

**Audience:** PRIMITIV team members  
**Access:** Existing dashboard auth  

### Layout

- Table listing all slots (both stages), sortable by start time
- "Add slot" button → inline form or modal: stage selector, start time, end time, artist name, optional note
- Edit / delete per row
- Uses existing Shadcn table + form components consistent with `/demandes` and `/paiements` pages

---

## Out of Scope

- Ticket purchase integration
- Practical info section (address, transport) — can be added later
- Multi-day schedule (single festival day assumed)
- Artist bios or photos

---

## Verification

1. Run `npm run dev` in `dashboard/` — confirm `/ekotone` is accessible without login
2. Log into dashboard, go to `/dashboard/ekotone`, add a slot → confirm it appears on the public page
3. Set a slot's time to include the current time → confirm "now playing" highlight appears
4. Test on mobile viewport — confirm readability and stage toggle work
5. Run `npm run prisma:migrate` — confirm `Slot` table is created cleanly
