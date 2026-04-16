"use client";

import { useEffect, useState } from "react";
import { NowView, Slot } from "@/features/schedule/now-view";
import { SlotDetail } from "@/features/schedule/slot-detail";
import { SlotList } from "@/features/schedule/slot-list";

type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";
type Stage = "MAIN" | "AFTER";
type View = "now" | "schedule";

const DAYS: { key: Day; label: string }[] = [
  { key: "FRIDAY", label: "Vendredi" },
  { key: "SATURDAY", label: "Samedi" },
  { key: "SUNDAY", label: "Dimanche" },
];

const FESTIVAL_START = new Date("2026-05-29T00:00:00");
const FESTIVAL_END = new Date("2026-06-01T00:00:00");

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day>("FRIDAY");
  const [selectedStage, setSelectedStage] = useState<Stage>("MAIN");
  const [view, setView] = useState<View>("schedule");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [now, setNow] = useState(() => {
    if (globalThis.window !== undefined) {
      const p = new URLSearchParams(globalThis.location.search).get("mockNow");
      if (p) return new Date(p);
    }
    return new Date();
  });
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
    setView("schedule");
    setSelectedSlot(null);
    const hasCurrentStage = slots.some(
      (s) => s.day === day && s.stage === selectedStage,
    );
    if (!hasCurrentStage)
      setSelectedStage(selectedStage === "MAIN" ? "AFTER" : "MAIN");
  };

  const filtered = slots
    .filter((s) => s.day === selectedDay && s.stage === selectedStage)
    .toSorted(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  const isPlaying = (slot: Slot) => {
    const t = now.getTime();
    return (
      t >= new Date(slot.startTime).getTime() &&
      t < new Date(slot.endTime).getTime()
    );
  };

  const nowSlot = slots.find((s) => isPlaying(s)) ?? null;
  const nextSlot =
    slots
      .filter((s) => new Date(s.startTime).getTime() > now.getTime())
      .toSorted(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )[0] ?? null;

  const isFestivalPeriod = now >= FESTIVAL_START && now < FESTIVAL_END;
  const showNowTab = nowSlot !== null || isFestivalPeriod;
  const effectiveView = !showNowTab && view === "now" ? "schedule" : view;

  const dayLabel = (day: Day) =>
    day === "FRIDAY" ? "Vendredi" : (day === "SATURDAY" ? "Samedi" : "Dimanche");

  return (
    <div className="min-h-svh bg-sch-bg text-sch-text relative antialiased">
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_BG, backgroundSize: "300px 300px" }}
      />

      <div className="relative z-[1] pb-[4.5rem]">
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
          {showNowTab && (
            <button
              role="tab"
              aria-selected={effectiveView === "now"}
              onClick={() => { setView("now"); setSelectedSlot(null); }}
              className={[
                "shrink-0 bg-transparent border-b-2 -mb-px px-4 py-3.5",
                "font-barlow font-semibold text-[0.82rem] tracking-[0.12em] uppercase",
                "cursor-pointer transition-colors duration-150 whitespace-nowrap inline-flex items-center gap-1.5",
                effectiveView === "now"
                  ? "text-acid border-b-acid"
                  : (nowSlot
                    ? "text-sch-text border-transparent hover:text-acid"
                    : "text-sch-muted border-transparent hover:text-sch-text"),
              ].join(" ")}
            >
              {nowSlot && (
                <span className="w-[5px] h-[5px] rounded-full bg-acid shrink-0 animate-pulse-dot" />
              )}
              En ce moment
            </button>
          )}

          {DAYS.map(({ key, label }) => {
            const active = effectiveView === "schedule" && selectedDay === key;
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

        {/* Main content */}
        <main>
          {loading ? (
            <div className="font-mono-share text-[0.7rem] tracking-[0.2em] text-sch-muted uppercase text-center py-20 px-5">
              Chargement...
            </div>
          ) : (effectiveView === "now" ? (
            <NowView
              nowSlot={nowSlot}
              nextSlot={nextSlot}
              fmt={fmt}
              onSelectSlot={(slot) => { setSelectedSlot(slot); setView("schedule"); }}
            />
          ) : (
            <>
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
                      onClick={() => { setSelectedStage(stage); setSelectedSlot(null); }}
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

              {selectedSlot ? (
                <SlotDetail
                  slot={selectedSlot}
                  fmt={fmt}
                  dayLabel={dayLabel}
                  onBack={() => setSelectedSlot(null)}
                />
              ) : (filtered.length === 0 ? (
                <div className="font-mono-share text-[0.7rem] tracking-[0.2em] text-sch-muted uppercase text-center py-20 px-5">
                  Aucun set programmé
                </div>
              ) : (
                <SlotList
                  slots={filtered}
                  isPlaying={isPlaying}
                  fmt={fmt}
                  onSelect={setSelectedSlot}
                />
              ))}
            </>
          ))}
        </main>

        <footer className="px-5 py-10 font-mono-share text-[0.55rem] tracking-[0.25em] text-[#222] text-center uppercase">
          PRIMITIV · EKOTONE · 2026
        </footer>
      </div>

      {/* Bottom Nav */}
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 inset-x-0 z-50 bg-sch-bg border-t border-sch-border flex items-stretch h-[4.5rem]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          aria-current="page"
          className="flex flex-1 flex-col items-center justify-center gap-1 font-mono-share text-[0.55rem] tracking-[0.2em] uppercase text-acid cursor-pointer bg-transparent"
        >
          <svg
            aria-hidden="true"
            width="20" height="20" viewBox="0 0 20 20" fill="none"
            className="text-acid"
          >
            <rect x="2" y="4" width="16" height="13" rx="1.5"
                  stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Programme
        </button>
      </nav>
    </div>
  );
}
