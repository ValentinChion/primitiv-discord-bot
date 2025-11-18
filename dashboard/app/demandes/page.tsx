"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Statut = "PENDING" | "VALIDATED" | "DENIED";
type Type = "DEMANDE" | "PAIEMENT" | "REMBOURSEMENT";

interface Demande {
  id: number;
  name: string;
  userId: string;
  montant: number;
  description: string;
  type: Type;
  statut: Statut;
  createdAt: string;
  updatedAt: string;
  factureUrl: string | null;
  paiementId: number | null;
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch("/api/demandes");
      if (!response.ok) throw new Error("Failed to fetch demandes");
      const data = await response.json();
      setDemandes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: number, statut: Statut) => {
    try {
      const response = await fetch("/api/demandes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, statut }),
      });

      if (!response.ok) throw new Error("Failed to update demande");

      // Update local state
      setDemandes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut } : d))
      );
    } catch (err) {
      console.error("Error updating statut:", err);
      alert("Failed to update status");
    }
  };

  const getStatutBadgeColor = (statut: Statut) => {
    switch (statut) {
      case "VALIDATED":
        return "text-green-700 bg-green-100";
      case "DENIED":
        return "text-red-700 bg-red-100";
      case "PENDING":
        return "text-yellow-700 bg-yellow-100";
    }
  };

  const getTypeBadgeColor = (type: Type) => {
    switch (type) {
      case "DEMANDE":
        return "text-blue-700 bg-blue-100";
      case "PAIEMENT":
        return "text-purple-700 bg-purple-100";
      case "REMBOURSEMENT":
        return "text-orange-700 bg-orange-100";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Demandes Financières</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demandes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  demandes.map((demande) => (
                    <TableRow key={demande.id}>
                      <TableCell className="font-medium">{demande.id}</TableCell>
                      <TableCell>{demande.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {demande.userId}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {demande.montant.toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(
                            demande.type
                          )}`}
                        >
                          {demande.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(
                            demande.statut
                          )}`}
                        >
                          {demande.statut}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {demande.description}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={demande.statut}
                          onValueChange={(value) =>
                            updateStatut(demande.id, value as Statut)
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
