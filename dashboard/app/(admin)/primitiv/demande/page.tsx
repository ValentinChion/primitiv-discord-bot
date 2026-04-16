"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DemandesTable,
  Demande,
  Statut,
} from "@/features/demandes/demandes-table";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut }),
      });
      if (!response.ok) throw new Error("Failed to update demande");
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
          <DemandesTable
            demandes={demandes}
            onDelete={deleteDemande}
            onUpdateStatut={updateStatut}
          />
        </CardContent>
      </Card>
    </div>
  );
}
