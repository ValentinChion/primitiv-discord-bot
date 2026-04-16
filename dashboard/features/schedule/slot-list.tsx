type Stage = "MAIN" | "AFTER";
type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";

interface Slot {
  id: string;
  stage: Stage;
  day: Day;
  startTime: string;
  endTime: string;
  artistName: string;
  note: string | null;
  description: string | null;
  imageUrl: string | null;
}

const DELAYS = [0.03, 0.07, 0.11, 0.15, 0.19, 0.22, 0.25];

interface Props {
  slots: Slot[];
  isPlaying: (slot: Slot) => boolean;
  fmt: (iso: string) => string;
  onSelect: (slot: Slot) => void;
}

export function SlotList({ slots, isPlaying, fmt, onSelect }: Props) {
  return (
    <ul className="list-none px-5 m-0">
      {slots.map((slot, index) => {
        const playing = isPlaying(slot);
        return (
          <li
            key={slot.id}
            style={{ animationDelay: `${DELAYS[index] ?? 0.27}s` }}
            onClick={() => onSelect(slot)}
            className={[
              "grid grid-cols-[4.75rem_1fr] gap-x-3.5 py-5 border-b border-sch-border relative animate-fadein cursor-pointer hover:bg-white/[0.02] transition-colors",
              playing ? "bg-acid/[0.025]" : "",
            ].join(" ")}
          >
            {playing && (
              <span
                className="absolute left-[-1.25rem] top-0 bottom-0 w-0.5 bg-acid"
                style={{ boxShadow: "0 0 14px 2px rgba(221,255,0,0.35)" }}
              />
            )}

            <div className="pt-1 flex flex-col gap-0.5">
              <span className="font-mono-share text-[0.8rem] text-sch-text tracking-[0.04em]">
                {fmt(slot.startTime)}
              </span>
              <span className="font-mono-share text-[0.68rem] text-sch-muted tracking-[0.04em]">
                {fmt(slot.endTime)}
              </span>
            </div>

            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
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
              {slot.imageUrl && (
                <img
                  src={slot.imageUrl}
                  alt={slot.artistName}
                  className="w-10 h-10 shrink-0 object-cover rounded-sm opacity-70 self-center"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
