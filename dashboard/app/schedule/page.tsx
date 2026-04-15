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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;600&display=swap');

  :root {
    --acid: #DDFF00;
    --bg: #080808;
    --text: #EFEFEF;
    --muted: #484848;
    --border: #161616;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .sch-wrap {
    min-height: 100svh;
    background: var(--bg);
    position: relative;
  }

  .sch-noise {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 300px 300px;
  }

  .sch-content { position: relative; z-index: 1; }

  /* ── Header ── */
  .sch-header {
    padding: 2rem 1.25rem 1.25rem;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .sch-eyebrow {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    color: var(--acid);
    text-transform: uppercase;
    margin-bottom: 0.2rem;
  }

  .sch-title {
    font-family: 'Bebas Neue', cursive;
    font-size: clamp(4rem, 20vw, 8rem);
    line-height: 0.88;
    color: var(--text);
    letter-spacing: 0.01em;
  }

  .sch-meta {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    color: var(--muted);
    margin-top: 0.6rem;
    text-transform: uppercase;
  }

  .sch-watermark {
    position: absolute;
    right: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-family: 'Bebas Neue', cursive;
    font-size: clamp(6rem, 28vw, 11rem);
    line-height: 1;
    color: transparent;
    -webkit-text-stroke: 1px var(--border);
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.02em;
  }

  /* ── Day Tabs ── */
  .sch-days {
    display: flex;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0 1.25rem;
    gap: 0;
  }
  .sch-days::-webkit-scrollbar { display: none; }

  .sch-day-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    padding: 0.9rem 1rem 0.8rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }

  .sch-day-btn:hover { color: var(--text); }
  .sch-day-btn.active {
    color: var(--acid);
    border-bottom-color: var(--acid);
  }

  /* ── Stage Toggle ── */
  .sch-stages {
    display: flex;
    gap: 0.5rem;
    padding: 0.9rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }

  .sch-stage-btn {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 0.4rem 0.9rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .sch-stage-btn:hover { color: var(--text); border-color: #333; }
  .sch-stage-btn.active {
    border-color: var(--acid);
    color: var(--acid);
    background: rgba(221, 255, 0, 0.04);
  }

  /* ── Slot List ── */
  .sch-list {
    list-style: none;
    padding: 0 1.25rem;
    margin: 0;
  }

  .sch-slot {
    display: grid;
    grid-template-columns: 4.75rem 1fr;
    gap: 0 0.875rem;
    padding: 1.4rem 0;
    border-bottom: 1px solid var(--border);
    position: relative;
    animation: sch-fadein 0.35s ease both;
  }

  .sch-slot:nth-child(1) { animation-delay: 0.03s; }
  .sch-slot:nth-child(2) { animation-delay: 0.07s; }
  .sch-slot:nth-child(3) { animation-delay: 0.11s; }
  .sch-slot:nth-child(4) { animation-delay: 0.15s; }
  .sch-slot:nth-child(5) { animation-delay: 0.19s; }
  .sch-slot:nth-child(6) { animation-delay: 0.22s; }
  .sch-slot:nth-child(7) { animation-delay: 0.25s; }
  .sch-slot:nth-child(n+8) { animation-delay: 0.27s; }

  @keyframes sch-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sch-slot.playing {
    background: rgba(221, 255, 0, 0.025);
  }

  .sch-slot.playing::before {
    content: '';
    position: absolute;
    left: -1.25rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--acid);
    box-shadow: 0 0 14px 2px rgba(221,255,0,0.35);
  }

  .sch-time {
    padding-top: 0.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .sch-time-start {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    color: var(--text);
    letter-spacing: 0.04em;
  }

  .sch-time-end {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .sch-artist {
    font-family: 'Bebas Neue', cursive;
    font-size: clamp(2.2rem, 9.5vw, 3.5rem);
    line-height: 0.92;
    letter-spacing: 0.01em;
    color: var(--text);
    transition: color 0.2s;
  }

  .sch-slot.playing .sch-artist { color: var(--acid); }

  .sch-note {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.3rem;
  }

  .sch-now-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.4rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    color: var(--acid);
    text-transform: uppercase;
  }

  .sch-now-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--acid);
    box-shadow: 0 0 6px var(--acid);
    animation: sch-pulse 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes sch-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.65); }
  }

  /* ── States ── */
  .sch-empty, .sch-loading {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
    text-align: center;
    padding: 5rem 1.25rem;
  }

  .sch-footer {
    padding: 2.5rem 1.25rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    color: #222;
    text-align: center;
    text-transform: uppercase;
  }
`;

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
        // Auto-select first day that has any slots
        const first = DAYS.find((d) => data.some((s) => s.day === d.key));
        if (first) setSelectedDay(first.key);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Tick every 30s to keep "now playing" current
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleDayChange = (day: Day) => {
    setSelectedDay(day);
    // If current stage has no slots on new day, switch to the other
    const hasCurrentStage = slots.some((s) => s.day === day && s.stage === selectedStage);
    if (!hasCurrentStage) {
      setSelectedStage(selectedStage === "MAIN" ? "AFTER" : "MAIN");
    }
  };

  const filtered = slots
    .filter((s) => s.day === selectedDay && s.stage === selectedStage)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const isPlaying = (slot: Slot) => {
    const start = new Date(slot.startTime).getTime();
    const end = new Date(slot.endTime).getTime();
    const t = now.getTime();
    return t >= start && t < end;
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="sch-wrap">
        <div className="sch-noise" aria-hidden="true" />

        <div className="sch-content">
          {/* Header */}
          <header className="sch-header">
            <p className="sch-eyebrow">Programme Officiel</p>
            <h1 className="sch-title">EKOTONE</h1>
            <p className="sch-meta">PRIMITIV · Mai 2026 · Paris</p>
            <span className="sch-watermark" aria-hidden="true">2026</span>
          </header>

          {/* Day selector */}
          <nav className="sch-days" role="tablist" aria-label="Sélection du jour">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={selectedDay === key}
                className={`sch-day-btn${selectedDay === key ? " active" : ""}`}
                onClick={() => handleDayChange(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Stage toggle */}
          <div className="sch-stages" role="group" aria-label="Sélection de la scène">
            {(["MAIN", "AFTER"] as Stage[]).map((stage) => (
              <button
                key={stage}
                className={`sch-stage-btn${selectedStage === stage ? " active" : ""}`}
                onClick={() => setSelectedStage(stage)}
                aria-pressed={selectedStage === stage}
              >
                {stage === "MAIN" ? "Main Stage" : "After"}
              </button>
            ))}
          </div>

          {/* Schedule */}
          <main>
            {loading ? (
              <div className="sch-loading">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="sch-empty">Aucun set programmé</div>
            ) : (
              <ul className="sch-list">
                {filtered.map((slot) => {
                  const playing = isPlaying(slot);
                  return (
                    <li key={slot.id} className={`sch-slot${playing ? " playing" : ""}`}>
                      <div className="sch-time">
                        <span className="sch-time-start">{fmt(slot.startTime)}</span>
                        <span className="sch-time-end">{fmt(slot.endTime)}</span>
                      </div>
                      <div>
                        <div className="sch-artist">{slot.artistName}</div>
                        {slot.note && <div className="sch-note">{slot.note}</div>}
                        {playing && (
                          <div className="sch-now-badge">
                            <span className="sch-now-dot" />
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

          <footer className="sch-footer">PRIMITIV · EKOTONE · 2026</footer>
        </div>
      </div>
    </>
  );
}
