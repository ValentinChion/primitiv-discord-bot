"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SendResult {
  sent: number;
  failed: number;
}

export default function NotificationsPage() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/schedule");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notifications/subscribers/count")
      .then((r) => r.json())
      .then((data: { count: number }) => setSubscriberCount(data.count))
      .catch(() => setSubscriberCount(0));
  }, [result]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim() || "/schedule" }),
      });
      const data = await res.json() as SendResult;
      setResult(data);
    } catch {
      setError("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Notifications push</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {subscriberCount === null
          ? "Chargement…"
          : `${subscriberCount} abonné${subscriberCount !== 1 ? "s" : ""}`}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Envoyer une notification</CardTitle>
          <CardDescription>Envoyée à tous les appareils abonnés.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notif-title">Titre</Label>
            <Input
              id="notif-title"
              placeholder="EKOTONE 2026"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notif-body">Message</Label>
            <Textarea
              id="notif-body"
              placeholder="Le programme vient d'être mis à jour…"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notif-url">Lien (optionnel)</Label>
            <Input
              id="notif-url"
              placeholder="/schedule"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full"
          >
            {sending ? "Envoi en cours…" : "Envoyer à tous"}
          </Button>

          {result && (
            <p className="text-sm text-center text-muted-foreground">
              ✓ {result.sent} envoyé{result.sent !== 1 ? "s" : ""}
              {result.failed > 0 && ` · ${result.failed} échoué${result.failed !== 1 ? "s" : ""}`}
            </p>
          )}
          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
