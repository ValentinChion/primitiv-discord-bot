"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Stage = "MAIN" | "AFTER";

export interface Slot {
  id: string;
  stage: Stage;
  day: Day;
  startTime: string;
  endTime: string;
  artistName: string;
  note: string | null;
  description: string | null;
  imageUrl: string | null;
}

const DAY_LABEL: Record<Day, string> = {
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

interface Props {
  slots: Slot[];
  onEdit: (slot: Slot) => void;
  onDelete: (id: string) => void;
}

export function SlotsTable({ slots, onEdit, onDelete }: Props) {
  return (
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
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Aucun set pour le moment
            </TableCell>
          </TableRow>
        ) : (
          slots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{DAY_LABEL[slot.day]}</TableCell>
              <TableCell>
                {slot.stage === "MAIN" ? "Main Stage" : "After"}
              </TableCell>
              <TableCell>{formatTime(slot.startTime)}</TableCell>
              <TableCell>{formatTime(slot.endTime)}</TableCell>
              <TableCell className="font-medium">{slot.artistName}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {slot.note ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(slot)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(slot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
