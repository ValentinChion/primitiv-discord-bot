type Stage = "MAIN" | "CHILL";
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

interface Props {
  slot: Slot;
  fmt: (iso: string) => string;
  dayLabel: (day: Day) => string;
}

export function SlotDetail({ slot, fmt, dayLabel }: Props) {
  return (
    <div className="animate-fadein">
      {/* Poster — image + overlaid artist info */}
      <div className="relative w-full aspect-square overflow-hidden">
        {slot.imageUrl ? (
          <>
            {/* Atmospheric blurred backdrop */}
            <div aria-hidden="true" className="absolute inset-0 scale-110">
              <img
                src={slot.imageUrl}
                alt=""
                className="w-full h-full object-cover blur-3xl opacity-50"
              />
            </div>
            {/* Sharp artist image */}
            <img
              src={slot.imageUrl}
              alt={slot.artistName}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-sch-border" />
        )}

        {/* Top fade — blends into header */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sch-bg to-transparent" />

        {/* Bottom gradient — covers ~60% for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-sch-bg via-sch-bg/80 to-transparent" />

        {/* Overlaid artist info */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-7">
          {slot.note && (
            <p className="font-mono-share text-[0.6rem] tracking-[0.22em] uppercase text-acid mb-2">
              {slot.note}
            </p>
          )}
          <h2 className="font-bebas text-[clamp(3.5rem,18vw,7rem)] leading-[0.88] text-sch-text tracking-[0.01em]">
            {slot.artistName}
          </h2>
          <div className="h-px w-10 bg-gradient-brand mt-3 mb-3" />
          <p className="font-mono-share text-[0.65rem] tracking-[0.12em] text-sch-muted uppercase">
            {fmt(slot.startTime)} — {fmt(slot.endTime)}
            {" · "}
            {slot.stage === "MAIN" ? "Main Stage" : "Chill"}
            {" · "}
            {dayLabel(slot.day)}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pt-6 pb-12">
        <p className="font-barlow font-light text-[1rem] leading-relaxed text-sch-text/80 max-w-prose">
          {slot.description ?? "Reviens vite, la bio arrive très vite !"}
        </p>
      </div>
    </div>
  );
}
