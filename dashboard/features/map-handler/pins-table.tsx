import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

export type PinCategory = "SCENE" | "FOOD" | "SERVICES" | "INFOS" | "ACCESS";

export type MapPin = {
  id: string;
  label: string;
  category: PinCategory;
  lat: number;
  lon: number;
  description: string | null;
};

const CATEGORY_COLORS: Record<PinCategory, string> = {
  SCENE: "#DDFF00",
  FOOD: "#FF6B35",
  SERVICES: "#60A5FA",
  INFOS: "#A78BFA",
  ACCESS: "#DDFF00",
};

const CATEGORY_LABELS: Record<PinCategory, string> = {
  SCENE: "Scène",
  FOOD: "Food & Bar",
  SERVICES: "Services",
  INFOS: "Infos",
  ACCESS: "Accès",
};

interface Props {
  pins: MapPin[];
  onEdit: (pin: MapPin) => void;
  onDelete: (id: string) => void;
}

export function PinsTable({ pins, onEdit, onDelete }: Props) {
  if (pins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Aucun marqueur. Cliquez sur « Ajouter un marqueur » pour commencer.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Lat</TableHead>
          <TableHead>Lon</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pins.map((pin) => (
          <TableRow key={pin.id}>
            <TableCell className="font-medium">{pin.label}</TableCell>
            <TableCell>
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-sm"
                style={{
                  color: CATEGORY_COLORS[pin.category],
                  background: `${CATEGORY_COLORS[pin.category]}1a`,
                  border: `1px solid ${CATEGORY_COLORS[pin.category]}40`,
                }}
              >
                {CATEGORY_LABELS[pin.category]}
              </span>
            </TableCell>
            <TableCell className="font-mono text-xs">{pin.lat.toFixed(5)}</TableCell>
            <TableCell className="font-mono text-xs">{pin.lon.toFixed(5)}</TableCell>
            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
              {pin.description ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(pin)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(pin.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
