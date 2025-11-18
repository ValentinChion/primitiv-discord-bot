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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface Paiement {
  id: number;
  demandeId: number;
  montant: number;
  factureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  Demande: Demande[];
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      const response = await fetch("/api/paiements");
      if (!response.ok) throw new Error("Failed to fetch paiements");
      const data = await response.json();
      setPaiements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl">Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Demande ID</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead>Demandes associées</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paiements.map((paiement) => (
                    <TableRow key={paiement.id}>
                      <TableCell className="font-medium">{paiement.id}</TableCell>
                      <TableCell>{paiement.demandeId}</TableCell>
                      <TableCell className="font-semibold">
                        {paiement.montant.toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        {paiement.factureUrl ? (
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() =>
                              window.open(paiement.factureUrl!, "_blank")
                            }
                          >
                            Voir facture
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Aucune facture
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(paiement.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(paiement.updatedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {paiement.Demande && paiement.Demande.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {paiement.Demande.map((demande) => (
                              <span
                                key={demande.id}
                                className="text-xs text-muted-foreground"
                              >
                                {demande.name} ({demande.statut})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Aucune demande
                          </span>
                        )}
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
