"use client";

import { useEffect } from "react";
import { subscribeAndSave } from "@/lib/push-subscribe";

export function SwRegister() {
  useEffect(() => {
    if (globalThis.window === undefined || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Registration failed silently — app still works, just without offline support
        return;
      }

      // Silently re-subscribe users who already granted permission
      // (covers reinstalls or cleared browser data)
      if ("Notification" in globalThis && Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existing = await registration.pushManager.getSubscription();
          if (!existing) {
            await subscribeAndSave(registration);
          }
        } catch {
          // Push subscription failed silently
        }
      }
    });
  }, []);

  return null;
}
