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
import { type MapPin, type PinCategory } from "./pins-table";

export type PinForm = {
  label: string;
  category: PinCategory;
  lat: string;
  lon: string;
  description: string;
};

const EMPTY_FORM: PinForm = {
  label: "",
  category: "SCENE",
  lat: "",
  lon: "",
  description: "",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingPin: MapPin | null;
  onSave: (form: PinForm) => void;
}

export function PinDialog({ open, onOpenChange, editingPin, onSave }: Props) {
  const [form, setForm] = useState<PinForm>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (editingPin) {
      setForm({
        label: editingPin.label,
        category: editingPin.category,
        lat: editingPin.lat.toString(),
        lon: editingPin.lon.toString(),
        description: editingPin.description ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editingPin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPin ? "Modifier le marqueur" : "Ajouter un marqueur"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex: Main Stage, Bar, Douches..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Catégorie</label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as PinCategory })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCENE">Scène</SelectItem>
                <SelectItem value="FOOD">Food & Bar</SelectItem>
                <SelectItem value="SERVICES">Services</SelectItem>
                <SelectItem value="INFOS">Infos</SelectItem>
                <SelectItem value="ACCESS">Accès</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="0.00001"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="47.60549"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="0.00001"
                value={form.lon}
                onChange={(e) => setForm({ ...form, lon: e.target.value })}
                placeholder="3.94944"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description (optionnel)</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Sanitaires nord"
            />
          </div>

          <Button onClick={() => onSave(form)}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
