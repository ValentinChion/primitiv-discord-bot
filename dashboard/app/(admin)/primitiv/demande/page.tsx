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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Statut = "PENDING" | "VALIDATED" | "DENIED";

interface Demande {
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

const getStatutBadgeColor = (statut: Statut) => {
  switch (statut) {
    case "VALIDATED": {
      return "text-green-700 bg-green-100";
    }
    case "DENIED": {
      return "text-red-700 bg-red-100";
    }
    case "PENDING": {
      return "text-yellow-700 bg-yellow-100";
    }
  }
};

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch("/api/demandes");
      if (!response.ok) throw new Error("Failed to fetch demandes");
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteDemande = async (id: number) => {
    try {
      const response = await fetch(`/api/demandes?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete demande");
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting demande:", error);
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
        prev.map((d) => (d.id === id ? { ...d, statut } : d)),
      );
    } catch (error) {
      console.error("Error updating statut:", error);
      alert("Failed to update status");
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

  if (errorMessage) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Erreur: {errorMessage}</p>
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
                      <TableCell className="font-medium">
                        {demande.id}
                      </TableCell>
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
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(
                            demande.statut,
                          )}`}
                        >
                          {demande.statut}
                        </span>
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
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(demande.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                              <SelectItem value="VALIDATED">
                                VALIDATED
                              </SelectItem>
                              <SelectItem value="DENIED">DENIED</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteDemande(demande.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
