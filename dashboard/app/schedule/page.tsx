"use client";

import { useEffect, useState } from "react";

type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";
type Stage = "MAIN" | "AFTER";

interface Slot {
  id: string;
  stage: Stage;
  day: Day;
  startTime: string;
  endTime: string;
  artistName: string;
  note: string | null;
}

const DAYS: { key: Day; label: string }[] = [
  { key: "FRIDAY", label: "Vendredi" },
  { key: "SATURDAY", label: "Samedi" },
  { key: "SUNDAY", label: "Dimanche" },
];

const DELAYS = [0.03, 0.07, 0.11, 0.15, 0.19, 0.22, 0.25];

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day>("FRIDAY");
  const [selectedStage, setSelectedStage] = useState<Stage>("MAIN");
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data: Slot[]) => {
        setSlots(data);
        const first = DAYS.find((d) => data.some((s) => s.day === d.key));
        if (first) setSelectedDay(first.key);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleDayChange = (day: Day) => {
    setSelectedDay(day);
    const hasCurrentStage = slots.some((s) => s.day === day && s.stage === selectedStage);
    if (!hasCurrentStage) setSelectedStage(selectedStage === "MAIN" ? "AFTER" : "MAIN");
  };

  const filtered = slots
    .filter((s) => s.day === selectedDay && s.stage === selectedStage)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const isPlaying = (slot: Slot) => {
    const t = now.getTime();
    return t >= new Date(slot.startTime).getTime() && t < new Date(slot.endTime).getTime();
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-svh bg-sch-bg text-sch-text relative antialiased">
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_BG, backgroundSize: "300px 300px" }}
      />

      <div className="relative z-[1]">
        {/* Header */}
        <header className="pt-8 px-5 pb-5 border-b border-sch-border relative overflow-hidden">
          <p className="font-mono-share text-[0.6rem] tracking-[0.25em] text-acid uppercase mb-0.5">
            Programme Officiel
          </p>
          <h1 className="font-bebas text-[clamp(4rem,20vw,8rem)] leading-[0.88] text-sch-text tracking-[0.01em]">
            EKOTONE
          </h1>
          <p className="font-mono-share text-[0.62rem] tracking-[0.18em] text-sch-muted mt-2.5 uppercase">
            PRIMITIV · Mai 2026 · Paris
          </p>
          <span
            aria-hidden="true"
            className="absolute right-[-0.5rem] top-1/2 -translate-y-1/2 font-bebas text-[clamp(6rem,28vw,11rem)] leading-none text-transparent pointer-events-none select-none tracking-[-0.02em]"
            style={{ WebkitTextStroke: "1px #161616" } as React.CSSProperties}
          >
            2026
          </span>
        </header>

        {/* Day selector */}
        <nav
          role="tablist"
          aria-label="Sélection du jour"
          className="flex border-b border-sch-border px-5 no-scrollbar overflow-x-auto"
        >
          {DAYS.map(({ key, label }) => {
            const active = selectedDay === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => handleDayChange(key)}
                className={[
                  "shrink-0 bg-transparent border-b-2 -mb-px px-4 py-3.5",
                  "font-barlow font-semibold text-[0.82rem] tracking-[0.12em] uppercase",
                  "cursor-pointer transition-colors duration-150 whitespace-nowrap",
                  active
                    ? "text-acid border-b-acid"
                    : "text-sch-muted border-transparent hover:text-sch-text",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Stage toggle */}
        <div
          role="group"
          aria-label="Sélection de la scène"
          className="flex gap-2 px-5 py-3.5 border-b border-sch-border"
        >
          {(["MAIN", "AFTER"] as Stage[]).map((stage) => {
            const active = selectedStage === stage;
            return (
              <button
                key={stage}
                aria-pressed={active}
                onClick={() => setSelectedStage(stage)}
                className={[
                  "font-mono-share text-[0.62rem] tracking-[0.18em] uppercase",
                  "bg-transparent border px-3.5 py-1.5 cursor-pointer transition-all duration-150",
                  active
                    ? "border-acid text-acid bg-acid/[0.04]"
                    : "border-sch-border text-sch-muted hover:text-sch-text hover:border-[#333]",
                ].join(" ")}
              >
                {stage === "MAIN" ? "Main Stage" : "After"}
              </button>
            );
          })}
        </div>

        {/* Schedule */}
        <main>
          {loading ? (
            <div className="font-mono-share text-[0.7rem] tracking-[0.2em] text-sch-muted uppercase text-center py-20 px-5">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="font-mono-share text-[0.7rem] tracking-[0.2em] text-sch-muted uppercase text-center py-20 px-5">
              Aucun set programmé
            </div>
          ) : (
            <ul className="list-none px-5 m-0">
              {filtered.map((slot, index) => {
                const playing = isPlaying(slot);
                return (
                  <li
                    key={slot.id}
                    style={{ animationDelay: `${DELAYS[index] ?? 0.27}s` }}
                    className={[
                      "grid grid-cols-[4.75rem_1fr] gap-x-3.5 py-5 border-b border-sch-border relative animate-fadein",
                      playing ? "bg-acid/[0.025]" : "",
                    ].join(" ")}
                  >
                    {/* Playing indicator bar */}
                    {playing && (
                      <span
                        className="absolute left-[-1.25rem] top-0 bottom-0 w-0.5 bg-acid"
                        style={{ boxShadow: "0 0 14px 2px rgba(221,255,0,0.35)" }}
                      />
                    )}

                    {/* Time */}
                    <div className="pt-1 flex flex-col gap-0.5">
                      <span className="font-mono-share text-[0.8rem] text-sch-text tracking-[0.04em]">
                        {fmt(slot.startTime)}
                      </span>
                      <span className="font-mono-share text-[0.68rem] text-sch-muted tracking-[0.04em]">
                        {fmt(slot.endTime)}
                      </span>
                    </div>

                    {/* Artist info */}
                    <div>
                      <div
                        className={[
                          "font-bebas text-[clamp(2.2rem,9.5vw,3.5rem)] leading-[0.92] tracking-[0.01em] transition-colors duration-200",
                          playing ? "text-acid" : "text-sch-text",
                        ].join(" ")}
                      >
                        {slot.artistName}
                      </div>
                      {slot.note && (
                        <div className="font-mono-share text-[0.62rem] tracking-[0.12em] uppercase text-sch-muted mt-1">
                          {slot.note}
                        </div>
                      )}
                      {playing && (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 font-mono-share text-[0.58rem] tracking-[0.2em] text-acid uppercase">
                          <span className="w-[5px] h-[5px] rounded-full bg-acid shrink-0 animate-pulse-dot shadow-[0_0_6px_#DDFF00]" />
                          En cours
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        <footer className="px-5 py-10 font-mono-share text-[0.55rem] tracking-[0.25em] text-[#222] text-center uppercase">
          PRIMITIV · EKOTONE · 2026
        </footer>
      </div>
    </div>
  );
}
