"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Slot, type Day, type Stage } from "./slots-table";

export type SlotForm = {
  stage: Stage;
  day: Day;
  startTime: string;
  endTime: string;
  artistName: string;
  note: string;
  description: string;
  imageUrl: string;
};

export const EMPTY_FORM: SlotForm = {
  stage: "MAIN",
  day: "FRIDAY",
  startTime: "",
  endTime: "",
  artistName: "",
  note: "",
  description: "",
  imageUrl: "",
};

export const toTimeStr = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingSlot: Slot | null;
  onSave: (form: SlotForm) => void;
}

export function SlotDialog({ open, onOpenChange, editingSlot, onSave }: Props) {
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (editingSlot) {
      setForm({
        stage: editingSlot.stage,
        day: editingSlot.day,
        startTime: toTimeStr(editingSlot.startTime),
        endTime: toTimeStr(editingSlot.endTime),
        artistName: editingSlot.artistName,
        note: editingSlot.note ?? "",
        description: editingSlot.description ?? "",
        imageUrl: editingSlot.imageUrl ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editingSlot]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSlot ? "Modifier le set" : "Ajouter un set"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Jour</label>
            <Select
              value={form.day}
              onValueChange={(v) => setForm({ ...form, day: v as Day })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Jour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRIDAY">Vendredi</SelectItem>
                <SelectItem value="SATURDAY">Samedi</SelectItem>
                <SelectItem value="SUNDAY">Dimanche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Scène</label>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm({ ...form, stage: v as Stage })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Scène" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAIN">Main Stage</SelectItem>
                <SelectItem value="AFTER">After</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Heure de début</label>
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Heure de fin</label>
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Nom de l&apos;artiste
            </label>
            <Input
              value={form.artistName}
              onChange={(e) => setForm({ ...form, artistName: e.target.value })}
              placeholder="Nom de l'artiste"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Note / genre</label>
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Note / genre (optionnel)"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Image de l&apos;artiste
            </label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-full h-32 object-cover rounded mb-1"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: fd,
                });
                const { url } = await res.json();
                setForm((prev) => ({ ...prev, imageUrl: url }));
              }}
            />
            {form.imageUrl && (
              <button
                type="button"
                className="text-xs text-muted-foreground text-left"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
              >
                Supprimer l&apos;image
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="border rounded px-3 py-2 text-sm min-h-[80px] bg-background"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description de l'artiste (optionnel)"
            />
          </div>

          <Button onClick={() => onSave(form)}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
