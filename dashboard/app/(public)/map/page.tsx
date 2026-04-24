"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Map, {
  Marker,
  NavigationControl,
  type MarkerEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { type MapPin, type PinCategory } from "@/features/map-handler/pins-table";

type MarkerCategory = "scene" | "food" | "services" | "infos" | "access";

const CATEGORY_COLORS: Record<MarkerCategory, string> = {
  scene: "#DDFF00",
  food: "#FF6B35",
  services: "#60A5FA",
  infos: "#A78BFA",
  access: "#DDFF00",
};

const CATEGORY_LABELS: Record<MarkerCategory, string> = {
  scene: "Scène",
  food: "Food & Bar",
  services: "Services",
  infos: "Infos",
  access: "Accès",
};

const toMarkerCategory = (cat: PinCategory): MarkerCategory =>
  cat.toLowerCase() as MarkerCategory;

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

const FILTER_OPTIONS: { key: MarkerCategory | "all"; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "scene", label: "Scène" },
  { key: "food", label: "Food" },
  { key: "services", label: "Services" },
  { key: "infos", label: "Infos" },
  { key: "access", label: "Accès" },
];

export default function MapPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [filter, setFilter] = useState<MarkerCategory | "all">("all");
  const [panelVisible, setPanelVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    fetch("/api/map-pins")
      .then((r) => r.json())
      .then(setPins)
      .catch(() => {});
  }, []);

  const visible = pins.filter(
    (m) => filter === "all" || toMarkerCategory(m.category) === filter,
  );

  const selectPin = useCallback((pin: MapPin) => {
    setSelected(pin);
    setPanelVisible(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelVisible(false);
    setTimeout(() => setSelected(null), 300);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    globalThis.addEventListener("keydown", handleKey);
    return () => globalThis.removeEventListener("keydown", handleKey);
  }, [closePanel]);

  return (
    <div className="min-h-svh bg-[#080808] text-[#EFEFEF] relative antialiased overflow-hidden">
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[2] opacity-[0.035]"
        style={{ backgroundImage: NOISE_BG, backgroundSize: "300px 300px" }}
      />

      {/* Header */}
      <header className="relative z-[10] pt-8 px-5 pb-4 pointer-events-none">
        <p className="font-mono-share text-[0.6rem] tracking-[0.25em] text-[#DDFF00] uppercase mb-0.5">
          Carte du site
        </p>
        <h1 className="font-bebas text-[clamp(3.5rem,16vw,6rem)] leading-[0.88] text-[#EFEFEF] tracking-[0.01em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          EKOTONE
        </h1>
      </header>

      {/* Filter bar */}
      <nav
        aria-label="Filtrer par catégorie"
        className="relative z-[10] flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar"
      >
        {FILTER_OPTIONS.map(({ key, label }) => {
          const active = filter === key;
          const color =
            key !== "all" ? CATEGORY_COLORS[key as MarkerCategory] : "#DDFF00";
          return (
            <button
              key={key}
              onClick={() => setFilter(key as MarkerCategory | "all")}
              className="shrink-0 font-mono-share text-[0.58rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-all duration-150 cursor-pointer"
              style={{
                borderColor: active ? color : "#2a2a2a",
                color: active ? color : "#484848",
                backgroundColor: active ? `${color}0a` : "transparent",
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Map */}
      <div className="fixed inset-0 z-[1]">
        {!token ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono-share text-[0.7rem] tracking-[0.2em] text-[#484848] uppercase text-center px-10">
              Ajoute NEXT_PUBLIC_MAPBOX_TOKEN dans dashboard/.env
            </p>
          </div>
        ) : (
          <Map
            mapboxAccessToken={token}
            initialViewState={{
              longitude: 3.94944,
              latitude: 47.60549,
              zoom: 16.5,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            dragRotate={false}
            touchPitch={false}
            attributionControl={false}
          >
            <NavigationControl
              position="top-right"
              showCompass={false}
              style={{ marginTop: "11rem", marginRight: "0.75rem" }}
            />

            {visible.map((pin) => {
              const isSelected = selected?.id === pin.id;
              const cat = toMarkerCategory(pin.category);
              const color = CATEGORY_COLORS[cat];
              return (
                <Marker
                  key={pin.id}
                  longitude={pin.lon}
                  latitude={pin.lat}
                  anchor="bottom"
                  onClick={(e: MarkerEvent<MouseEvent>) => {
                    e.originalEvent.stopPropagation();
                    selectPin(pin);
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 cursor-pointer transition-all duration-150"
                    style={{
                      background: isSelected ? "#0F0F0F" : "#161616",
                      border: `1px solid ${isSelected ? color : "#2a2a2a"}`,
                      padding: "3px 8px 3px 6px",
                      boxShadow: isSelected
                        ? `0 0 12px ${color}40, 0 2px 8px rgba(0,0,0,0.6)`
                        : "0 2px 6px rgba(0,0,0,0.5)",
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    <span
                      className="w-[6px] h-[6px] rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span
                      className="font-mono-share text-[0.55rem] tracking-[0.15em] uppercase whitespace-nowrap leading-none"
                      style={{ color: isSelected ? color : "#EFEFEF" }}
                    >
                      {pin.label}
                    </span>
                  </div>
                  {/* Stem */}
                  <div
                    className="mx-auto"
                    style={{
                      width: "1px",
                      height: "6px",
                      background: isSelected ? color : "#2a2a2a",
                      marginTop: "-1px",
                    }}
                  />
                </Marker>
              );
            })}
          </Map>
        )}
      </div>

      {/* Backdrop */}
      {panelVisible && (
        <div className="fixed inset-0 z-[20]" onClick={closePanel} />
      )}

      {/* Slide-up panel */}
      <div
        ref={panelRef}
        className="fixed bottom-[4.5rem] inset-x-0 z-[30] transition-transform duration-300 ease-out"
        style={{
          transform: panelVisible ? "translateY(0)" : "translateY(110%)",
        }}
      >
        {selected && (() => {
          const cat = toMarkerCategory(selected.category);
          const color = CATEGORY_COLORS[cat];
          return (
            <div className="mx-4 mb-2 bg-[#0F0F0F] border border-[#2a2a2a] shadow-2xl">
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className="inline-block font-mono-share text-[0.52rem] tracking-[0.18em] uppercase px-2 py-0.5 mb-2"
                      style={{
                        color,
                        border: `1px solid ${color}40`,
                        background: `${color}0d`,
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <h2
                      className="font-bebas text-[2.2rem] leading-[0.9] tracking-[0.02em]"
                      style={{ color }}
                    >
                      {selected.label}
                    </h2>
                  </div>
                  <button
                    onClick={closePanel}
                    aria-label="Fermer"
                    className="font-mono-share text-[1rem] text-[#888] hover:text-[#ccc] cursor-pointer bg-transparent border-none mt-1 shrink-0"
                  >
                    ×
                  </button>
                </div>
                {selected.description && (
                  <p className="font-mono-share text-[0.62rem] tracking-[0.1em] text-[#484848] uppercase leading-relaxed">
                    {selected.description}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom Nav */}
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 inset-x-0 z-[40] bg-[#080808] border-t border-[#161616] flex items-stretch h-[4.5rem]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/schedule"
          className="flex flex-1 flex-col items-center justify-center gap-1 font-mono-share text-[0.55rem] tracking-[0.2em] uppercase text-[#484848] hover:text-[#EFEFEF] transition-colors cursor-pointer"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Programme
        </Link>
        <button
          aria-current="page"
          className="flex flex-1 flex-col items-center justify-center gap-1 font-mono-share text-[0.55rem] tracking-[0.2em] uppercase text-[#DDFF00] cursor-pointer bg-transparent"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#DDFF00]">
            <path d="M10 2C7.239 2 5 4.239 5 7c0 3.866 5 11 5 11s5-7.134 5-11c0-2.761-2.239-5-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="10" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Carte
        </button>
      </nav>
    </div>
  );
}
