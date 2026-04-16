"use client";

import { useEffect, useState } from "react";
import { subscribeAndSave } from "@/lib/push-subscribe";

const DISMISSED_KEY = "ekotone-notif-dismissed";

export function NotificationOptIn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    setVisible(true);
  }, []);

  const handleEnable = async () => {
    setVisible(false);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await subscribeAndSave(registration);
    } catch {
      // Push subscription failed silently
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center justify-between gap-3 bg-[#161616] border border-[#2a2a2a] px-4 py-3 shadow-lg">
      <div className="min-w-0">
        <p className="font-mono-share text-[0.65rem] tracking-[0.15em] uppercase text-[#DDFF00] leading-tight">
          Activer les notifications
        </p>
        <p className="font-mono-share text-[0.58rem] tracking-[0.1em] uppercase text-[#555] mt-0.5">
          Alertes programme · Annonces live
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="font-mono-share text-[0.6rem] tracking-[0.18em] uppercase bg-[#DDFF00] text-[#0F0F0F] px-3 py-1.5 cursor-pointer"
        >
          Activer
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Fermer"
          className="font-mono-share text-[0.7rem] text-[#444] hover:text-[#888] cursor-pointer bg-transparent border-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
