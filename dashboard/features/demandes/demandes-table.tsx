"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StatutBadge, Statut } from "./statut-badge";

export type { Statut };

export interface Demande {
  id: number;
  name: string;
  userId: string;
  discordUsername: string | null;
  montant: number;
  description: string;
  statut: Statut;
  createdAt: string;
  factureUrl: string | null;
}

interface Props {
  demandes: Demande[];
  onDelete: (id: number) => void;
  onUpdateStatut: (id: number, statut: Statut) => void;
}

export function DemandesTable({ demandes, onDelete, onUpdateStatut }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demandes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Aucune demande trouvée
              </TableCell>
            </TableRow>
          ) : (
            demandes.map((demande) => (
              <TableRow key={demande.id}>
                <TableCell className="font-medium">{demande.id}</TableCell>
                <TableCell>{demande.name}</TableCell>
                <TableCell>
                  {demande.discordUsername ?? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {demande.userId}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {demande.montant.toFixed(2)} €
                </TableCell>
                <TableCell>
                  <StatutBadge statut={demande.statut} />
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {demande.description}
                </TableCell>
                <TableCell>
                  {demande.factureUrl ? (
                    <a
                      href={demande.factureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      value={demande.statut}
                      onValueChange={(value) =>
                        onUpdateStatut(demande.id, value as Statut)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="VALIDATED">VALIDATED</SelectItem>
                        <SelectItem value="DENIED">DENIED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(demande.id)}
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
    </div>
  );
}
