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

const DAY_DATES: Record<Day, string> = {
  FRIDAY: "2026-05-29",
  SATURDAY: "2026-05-30",
  SUNDAY: "2026-05-31",
};

const toTimeStr = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

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
      startTime: toTimeStr(slot.startTime),
      endTime: toTimeStr(slot.endTime),
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
      body: JSON.stringify({
        ...form,
        startTime: `${DAY_DATES[form.day]}T${form.startTime}`,
        endTime: `${DAY_DATES[form.day]}T${form.endTime}`,
        note: form.note || null,
      }),
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
          <CardTitle className="text-2xl">Programme — Ekotone</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Ajouter un set</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSlot ? "Modifier le set" : "Ajouter un set"}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Jour</label>
                  <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v as Day })}>
                    <SelectTrigger><SelectValue placeholder="Jour" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRIDAY">Vendredi</SelectItem>
                      <SelectItem value="SATURDAY">Samedi</SelectItem>
                      <SelectItem value="SUNDAY">Dimanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Scène</label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Stage })}>
                    <SelectTrigger><SelectValue placeholder="Scène" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">Main Stage</SelectItem>
                      <SelectItem value="AFTER">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Heure de début</label>
                  <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Heure de fin</label>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Nom de l&apos;artiste</label>
                  <Input value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })} placeholder="Nom de l'artiste" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Note / genre</label>
                  <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note / genre (optionnel)" />
                </div>
                <Button onClick={saveSlot}>Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jour</TableHead>
                <TableHead>Scène</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Artiste</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Aucun set pour le moment</TableCell></TableRow>
              ) : slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.day === "FRIDAY" ? "Vendredi" : slot.day === "SATURDAY" ? "Samedi" : "Dimanche"}</TableCell>
                  <TableCell>{slot.stage === "MAIN" ? "Main Stage" : "After"}</TableCell>
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
