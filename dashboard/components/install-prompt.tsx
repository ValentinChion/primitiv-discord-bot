"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "ekotone-install-dismissed";

type PromptKind = "android" | "ios" | null;

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true)
  );
}

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      aria-label="Fermer"
      className="font-mono-share text-[0.7rem] text-[#444] hover:text-[#888] cursor-pointer bg-transparent border-none px-1 shrink-0"
    >
      ×
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="inline-block align-middle text-[#DDFF00]"
    >
      <rect x="3" y="6" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v8M5.5 3.5L8 1l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BANNER_CLASS =
  "fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 bg-[#161616] border border-[#2a2a2a] px-4 py-3 shadow-lg";

function AndroidBanner({
  prompt,
  onDismiss,
  onInstalled,
}: {
  prompt: BeforeInstallPromptEvent;
  onDismiss: () => void;
  onInstalled: () => void;
}) {
  const handleInstall = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") onInstalled();
  };

  return (
    <div className={BANNER_CLASS}>
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
        <DismissButton onDismiss={onDismiss} />
      </div>
    </div>
  );
}

function IosBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className={BANNER_CLASS}>
      <div className="min-w-0">
        <p className="font-mono-share text-[0.65rem] tracking-[0.15em] uppercase text-[#DDFF00] leading-tight">
          Installer l&apos;appli
        </p>
        <p className="font-mono-share text-[0.58rem] tracking-[0.1em] uppercase text-[#555] mt-0.5">
          Appuyez sur <ShareIcon /> puis{" "}
          <span className="text-[#888]">&laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;</span>
        </p>
      </div>
      <DismissButton onDismiss={onDismiss} />
    </div>
  );
}

export function InstallPrompt() {
  const [kind, setKind] = useState<PromptKind>(null);
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (isStandalone()) return;

    if (isIos()) {
      setKind("ios");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
      setKind("android");
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setKind(null);
  };

  if (kind === null) return null;

  if (kind === "ios") return <IosBanner onDismiss={dismiss} />;

  return (
    <AndroidBanner
      prompt={androidPrompt!}
      onDismiss={dismiss}
      onInstalled={() => setKind(null)}
    />
  );
}
