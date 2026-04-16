export default function OfflinePage() {
  return (
    <div className="min-h-svh bg-[#0F0F0F] text-[#DDFF00] flex flex-col items-center justify-center px-5 antialiased">
      <p className="font-mono-share text-[0.6rem] tracking-[0.25em] uppercase text-[#555] mb-3">
        Connexion perdue
      </p>
      <h1 className="font-bebas text-[clamp(4rem,20vw,8rem)] leading-[0.88] tracking-[0.01em]">
        OFFLINE
      </h1>
      <p className="font-mono-share text-[0.7rem] tracking-[0.15em] uppercase text-[#555] mt-4 text-center max-w-xs">
        Le programme est disponible hors-ligne une fois chargé au moins une fois.
      </p>
      <a
        href="/schedule"
        className="mt-10 font-mono-share text-[0.65rem] tracking-[0.2em] uppercase border border-[#DDFF00] text-[#DDFF00] px-5 py-2.5"
      >
        Réessayer
      </a>
      <footer className="absolute bottom-6 font-mono-share text-[0.55rem] tracking-[0.25em] text-[#222] uppercase">
        PRIMITIV · EKOTONE · 2026
      </footer>
    </div>
  );
}
