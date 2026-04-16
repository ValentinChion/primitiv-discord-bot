// Converts a base64url-encoded VAPID public key to a Uint8Array for PushManager.subscribe()
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeAndSave(registration: ServiceWorkerRegistration): Promise<void> {
  const applicationServerKey = urlBase64ToUint8Array(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  ).buffer as ArrayBuffer;

  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
}
