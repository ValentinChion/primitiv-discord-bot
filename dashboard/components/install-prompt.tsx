"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "ekotone-install-dismissed";

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 bg-[#161616] border border-[#2a2a2a] px-4 py-3 shadow-lg">
      <div className="min-w-0">
        <p className="font-mono-share text-[0.65rem] tracking-[0.15em] uppercase text-[#DDFF00] leading-tight">
          Installer l&apos;appli
        </p>
        <p className="font-mono-share text-[0.58rem] tracking-[0.1em] uppercase text-[#555] mt-0.5">
          Accès hors-ligne · Écran d&apos;accueil
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="font-mono-share text-[0.6rem] tracking-[0.18em] uppercase bg-[#DDFF00] text-[#0F0F0F] px-3 py-1.5 cursor-pointer"
        >
          Installer
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
