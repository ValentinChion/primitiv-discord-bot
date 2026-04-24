"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { PinsTable, type MapPin } from "@/features/map-handler/pins-table";
import { PinDialog, type PinForm } from "@/features/map-handler/pin-dialog";

export default function MapHandlerPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);

  const fetchPins = async () => {
    const res = await fetch("/api/map-pins");
    const data = await res.json();
    setPins(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const openAdd = () => {
    setEditingPin(null);
    setDialogOpen(true);
  };

  const openEdit = (pin: MapPin) => {
    setEditingPin(pin);
    setDialogOpen(true);
  };

  const savePin = async (form: PinForm) => {
    const method = editingPin ? "PUT" : "POST";
    const url = editingPin ? `/api/map-pins/${editingPin.id}` : "/api/map-pins";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setDialogOpen(false);
    fetchPins();
  };

  const deletePin = async (id: string) => {
    await fetch(`/api/map-pins/${id}`, { method: "DELETE" });
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <div className="container mx-auto p-6">Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Carte — Ekotone</CardTitle>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un marqueur
          </Button>
        </CardHeader>
        <CardContent>
          <PinsTable pins={pins} onEdit={openEdit} onDelete={deletePin} />
        </CardContent>
      </Card>

      <PinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPin={editingPin}
        onSave={savePin}
      />
    </div>
  );
}
