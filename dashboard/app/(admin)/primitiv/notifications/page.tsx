"use client";

import { useEffect, useState } from "react";
import {
  NotificationForm,
  SendResult,
} from "@/features/notifications/notification-form";

export default function NotificationsPage() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notifications/subscribers/count")
      .then((r) => r.json())
      .then((data: { count: number }) => setSubscriberCount(data.count))
      .catch(() => setSubscriberCount(0));
  }, [result]);

  const handleSend = async (title: string, body: string, url: string) => {
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = (await res.json()) as SendResult;
      setResult(data);
    } catch {
      setError("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <NotificationForm
      subscriberCount={subscriberCount}
      sending={sending}
      result={result}
      error={error}
      onSend={handleSend}
    />
  );
}
