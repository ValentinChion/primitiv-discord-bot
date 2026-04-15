# Ekotone Festival Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public mobile-first festival schedule page at `/schedule` plus an admin CRUD UI at `/primitiv/schedule-handler`, while moving existing dashboard routes under `/primitiv/`.

**Architecture:** Next.js App Router route groups split the app into `(admin)` (has Navbar, existing + new admin pages) and public (`/schedule`, no Navbar). A new `Slot` Prisma model stores set times. The public page is built with a fully custom dark UI via the `frontend-design` skill.

**Tech Stack:** Next.js 16 App Router · Prisma 6 · PostgreSQL · Tailwind CSS v4 · Shadcn (admin only) · TypeScript

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `dashboard/prisma/schema.prisma` | Add `Slot`, `Day`, `Stage` |
| Modify | `bot/prisma/schema.prisma` | Keep in sync with dashboard schema |
| Create | `dashboard/app/api/schedule/route.ts` | GET all slots (public), POST new slot |
| Create | `dashboard/app/api/schedule/[id]/route.ts` | PUT update slot, DELETE slot |
| Modify | `dashboard/app/layout.tsx` | Remove `<Navbar />`, keep html/body/fonts only |
| Create | `dashboard/app/(admin)/layout.tsx` | Adds `<Navbar />` for admin pages |
| Move | `dashboard/app/page.tsx` → `dashboard/app/(admin)/page.tsx` | Home stays at `/` |
| Move | `dashboard/app/demandes/` → `dashboard/app/(admin)/primitiv/demande/` | Route becomes `/primitiv/demande` |
| Create | `dashboard/app/demandes/page.tsx` | Redirect `/demandes` → `/primitiv/demande` |
| Modify | `dashboard/components/navbar.tsx` | Update link to `/primitiv/demande` |
| Create | `dashboard/app/(admin)/primitiv/schedule-handler/page.tsx` | Admin CRUD for slots |
| Create | `dashboard/app/schedule/page.tsx` | Public festival schedule (frontend-design skill) |

---

## Task 1: Add Slot model to Prisma schemas

**Files:**
- Modify: `dashboard/prisma/schema.prisma`
- Modify: `bot/prisma/schema.prisma`

- [ ] **Step 1: Add enums and Slot model to dashboard schema**

Open `dashboard/prisma/schema.prisma` and append after the existing `Paiement` model:

```prisma
enum Day {
  FRIDAY
  SATURDAY
  SUNDAY
}

enum Stage {
  MAIN
  AFTER
}

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
```

- [ ] **Step 2: Add the same enums and model to bot schema**

Open `bot/prisma/schema.prisma` and append the identical block after the last model. The bot schema must stay in sync with the dashboard schema.

- [ ] **Step 3: Run migration**

```bash
cd dashboard
npm run prisma:migrate
# When prompted for migration name, enter: add_slot_model
```

Expected output:
```
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

- [ ] **Step 4: Regenerate bot Prisma client**

```bash
cd bot
npm run prisma:generate
```

- [ ] **Step 5: Commit**

```bash
git add dashboard/prisma/schema.prisma bot/prisma/schema.prisma dashboard/prisma/migrations/
git commit -m "feat(dashboard): add Slot model with Day and Stage enums"
```

---

## Task 2: Create schedule API routes

**Files:**
- Create: `dashboard/app/api/schedule/route.ts`
- Create: `dashboard/app/api/schedule/[id]/route.ts`

- [ ] **Step 1: Create `app/api/schedule/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, day, startTime, endTime, artistName, note } = body;

    if (!stage || !day || !startTime || !endTime || !artistName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slot = await prisma.slot.create({
      data: { stage, day, startTime: new Date(startTime), endTime: new Date(endTime), artistName, note },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/schedule/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { stage, day, startTime, endTime, artistName, note } = body;

    const slot = await prisma.slot.update({
      where: { id: params.id },
      data: {
        stage,
        day,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        artistName,
        note,
      },
    });
    return NextResponse.json(slot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.slot.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Manual verification**

```bash
cd dashboard && npm run dev
# In another terminal:
curl http://localhost:33/api/schedule
```
Expected: `[]` (empty array, no slots yet)

- [ ] **Step 4: Commit**

```bash
git add dashboard/app/api/schedule/
git commit -m "feat(dashboard): add schedule API routes (GET, POST, PUT, DELETE)"
```

---

## Task 3: Restructure layouts and rename routes

This task introduces a Next.js App Router route group `(admin)` so that the public `/schedule` page can have a different layout (no Navbar) while all admin pages keep the Navbar.

**Files:**
- Modify: `dashboard/app/layout.tsx`
- Create: `dashboard/app/(admin)/layout.tsx`
- Move: `dashboard/app/page.tsx` → `dashboard/app/(admin)/page.tsx`
- Move: `dashboard/app/demandes/page.tsx` → `dashboard/app/(admin)/primitiv/demande/page.tsx`
- Create: `dashboard/app/demandes/page.tsx` (redirect)
- Modify: `dashboard/components/navbar.tsx`

- [ ] **Step 1: Strip Navbar from root layout**

Replace the content of `dashboard/app/layout.tsx` with:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRIMITIV",
  description: "PRIMITIV",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create admin route group layout**

Create `dashboard/app/(admin)/layout.tsx`:

```typescript
import { Navbar } from "@/components/navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

- [ ] **Step 3: Move home page into admin group**

```bash
mkdir -p dashboard/app/\(admin\)
cp dashboard/app/page.tsx dashboard/app/\(admin\)/page.tsx
rm dashboard/app/page.tsx
```

- [ ] **Step 4: Move demandes page into new route**

```bash
mkdir -p dashboard/app/\(admin\)/primitiv/demande
cp dashboard/app/demandes/page.tsx dashboard/app/\(admin\)/primitiv/demande/page.tsx
```

Open `dashboard/app/(admin)/primitiv/demande/page.tsx` and update the two `fetch` call URLs from `/api/demandes` to `/api/demandes` (no change needed — API routes are not affected by route groups).

- [ ] **Step 5: Add redirect from old `/demandes` route**

Replace the content of `dashboard/app/demandes/page.tsx` with:

```typescript
import { redirect } from "next/navigation";

export default function DemandesRedirect() {
  redirect("/primitiv/demande");
}
```

- [ ] **Step 6: Update Navbar links**

Replace the content of `dashboard/components/navbar.tsx` with:

```typescript
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              PRIMITIV
            </Link>
            <div className="flex gap-6">
              <Link
                href="/primitiv/demande"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Demandes
              </Link>
              <Link
                href="/primitiv/schedule-handler"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 7: Update home page link**

Open `dashboard/app/(admin)/page.tsx` and update the `<Link href="/demandes">` to `<Link href="/primitiv/demande">`.

- [ ] **Step 8: Manual verification**

```bash
cd dashboard && npm run dev
```

- Visit `http://localhost:33/` → home page with Navbar ✓
- Visit `http://localhost:33/primitiv/demande` → demandes table with Navbar ✓
- Visit `http://localhost:33/demandes` → redirects to `/primitiv/demande` ✓

- [ ] **Step 9: Commit**

```bash
git add dashboard/app/ dashboard/components/navbar.tsx
git commit -m "refactor(dashboard): restructure routes under /primitiv/ with (admin) layout group"
```

---

## Task 4: Admin schedule handler page

**Files:**
- Create: `dashboard/app/(admin)/primitiv/schedule-handler/page.tsx`

- [ ] **Step 1: Create the page**

Create `dashboard/app/(admin)/primitiv/schedule-handler/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, Plus } from "lucide-react";

type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";
type Stage = "MAIN" | "AFTER";

interface Slot {
  id: string;
  stage: Stage;
  day: Day;
  startTime: string;
  endTime: string;
  artistName: string;
  note: string | null;
}

const EMPTY_FORM = { stage: "MAIN" as Stage, day: "FRIDAY" as Day, startTime: "", endTime: "", artistName: "", note: "" };

const DAY_ORDER: Record<Day, number> = { FRIDAY: 0, SATURDAY: 1, SUNDAY: 2 };

export default function ScheduleHandlerPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    const res = await fetch("/api/schedule");
    const data = await res.json();
    setSlots(data.sort((a: Slot, b: Slot) => DAY_ORDER[a.day] - DAY_ORDER[b.day] || new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    setLoading(false);
  };

  const openAdd = () => { setEditingSlot(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setForm({
      stage: slot.stage,
      day: slot.day,
      startTime: slot.startTime.slice(0, 16),
      endTime: slot.endTime.slice(0, 16),
      artistName: slot.artistName,
      note: slot.note ?? "",
    });
    setDialogOpen(true);
  };

  const saveSlot = async () => {
    const method = editingSlot ? "PUT" : "POST";
    const url = editingSlot ? `/api/schedule/${editingSlot.id}` : "/api/schedule";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, note: form.note || null }),
    });
    setDialogOpen(false);
    fetchSlots();
  };

  const deleteSlot = async (id: string) => {
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="container mx-auto p-6">Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Schedule — Ekotone</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSlot ? "Edit slot" : "Add slot"}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v as Day })}>
                  <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRIDAY">Friday</SelectItem>
                    <SelectItem value="SATURDAY">Saturday</SelectItem>
                    <SelectItem value="SUNDAY">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Stage })}>
                  <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Main Stage</SelectItem>
                    <SelectItem value="AFTER">After</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="Start time" />
                <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="End time" />
                <Input value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })} placeholder="Artist name" />
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note / genre (optional)" />
                <Button onClick={saveSlot}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No slots yet</TableCell></TableRow>
              ) : slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.day}</TableCell>
                  <TableCell>{slot.stage}</TableCell>
                  <TableCell>{formatTime(slot.startTime)}</TableCell>
                  <TableCell>{formatTime(slot.endTime)}</TableCell>
                  <TableCell className="font-medium">{slot.artistName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{slot.note ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(slot)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => deleteSlot(slot.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

```bash
cd dashboard && npm run dev
```

- Visit `http://localhost:33/primitiv/schedule-handler`
- Click "Add slot", fill in a slot (e.g. Friday / MAIN / artist "DJ Test"), click Save
- Confirm the slot appears in the table
- Click edit, change the artist name, Save → confirms PUT works
- Click delete → confirms DELETE works

- [ ] **Step 3: Verify slot appears via API**

```bash
curl http://localhost:33/api/schedule
```

Expected: array with the slot you just created.

- [ ] **Step 4: Commit**

```bash
git add dashboard/app/\(admin\)/primitiv/schedule-handler/
git commit -m "feat(dashboard): add admin schedule handler page at /primitiv/schedule-handler"
```

---

## Task 5: Public festival schedule page

This task uses the **`frontend-design` skill** to build the artistic public UI. The engineer must invoke that skill with the description below. Do not use Shadcn components.

**Files:**
- Create: `dashboard/app/schedule/page.tsx`

- [ ] **Step 1: Invoke the frontend-design skill**

Invoke the `frontend-design` skill with this brief:

> Build a public festival schedule page at `dashboard/app/schedule/page.tsx` for the PRIMITIV / Ekotone festival. No Navbar (root layout has none for this route). Dark background, bold artistic typography, rave/festival aesthetic. The page fetches slots from `/api/schedule` (GET, no auth). Data shape: `{ id, stage: "MAIN"|"AFTER", day: "FRIDAY"|"SATURDAY"|"SUNDAY", startTime: ISO string, endTime: ISO string, artistName: string, note: string|null }[]`. Three-level navigation: Day (Friday/Saturday/Sunday) → Stage (Main Stage/After) → slot list. Each slot shows time range + artist name prominently + optional note. A "now playing" highlight shows the slot whose startTime ≤ now < endTime (computed client-side, no server state). Mobile-first. No Shadcn — fully custom CSS with Tailwind utility classes for layout.

- [ ] **Step 2: Manual verification**

```bash
cd dashboard && npm run dev
```

- Visit `http://localhost:33/schedule` — confirm no Navbar
- Confirm dark artistic design renders correctly on a mobile viewport (DevTools → iPhone)
- Add a slot in the admin panel whose time window includes the current time → confirm the "now playing" highlight appears
- Switch between Friday / Saturday / Sunday → only slots for that day show
- Switch between Main Stage / After → only slots for that stage show

- [ ] **Step 3: Commit**

```bash
git add dashboard/app/schedule/
git commit -m "feat(dashboard): add public festival schedule page at /schedule"
```

---

## Final verification checklist

- [ ] `http://localhost:33/` — home page, Navbar visible
- [ ] `http://localhost:33/primitiv/demande` — demandes table, Navbar visible
- [ ] `http://localhost:33/demandes` — redirects to `/primitiv/demande`
- [ ] `http://localhost:33/primitiv/schedule-handler` — admin CRUD, Navbar visible
- [ ] `http://localhost:33/schedule` — public schedule, **no Navbar**, dark artistic design
- [ ] `npm run prisma:migrate` succeeded and `Slot` table exists in DB
- [ ] Add a slot in admin → appears on public page within a page refresh
