"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  SlotsTable,
  Slot,
  Day,
} from "@/features/schedule-handler/slots-table";
import {
  SlotDialog,
  SlotForm,
} from "@/features/schedule-handler/slot-dialog";

const DAY_ORDER: Record<Day, number> = { FRIDAY: 0, SATURDAY: 1, SUNDAY: 2 };

const DAY_DATES: Record<Day, string> = {
  FRIDAY: "2026-05-29",
  SATURDAY: "2026-05-30",
  SUNDAY: "2026-05-31",
};

export default function ScheduleHandlerPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    const res = await fetch("/api/schedule");
    const data = await res.json();
    setSlots(
      data.toSorted(
        (a: Slot, b: Slot) =>
          DAY_ORDER[a.day] - DAY_ORDER[b.day] ||
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const openAdd = () => {
    setEditingSlot(null);
    setDialogOpen(true);
  };

  const openEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setDialogOpen(true);
  };

  const saveSlot = async (form: SlotForm) => {
    const method = editingSlot ? "PUT" : "POST";
    const url = editingSlot
      ? `/api/schedule/${editingSlot.id}`
      : "/api/schedule";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startTime: `${DAY_DATES[form.day]}T${form.startTime}`,
        endTime: `${DAY_DATES[form.day]}T${form.endTime}`,
        note: form.note || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
      }),
    });
    setDialogOpen(false);
    fetchSlots();
  };

  const deleteSlot = async (id: string) => {
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading)
    return <div className="container mx-auto p-6">Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Programme — Ekotone</CardTitle>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un set
          </Button>
        </CardHeader>
        <CardContent>
          <SlotsTable
            slots={slots}
            onEdit={openEdit}
            onDelete={deleteSlot}
          />
        </CardContent>
      </Card>

      <SlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSlot={editingSlot}
        onSave={saveSlot}
      />
    </div>
  );
}
