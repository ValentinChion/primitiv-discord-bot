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

interface Props {
  slot: Slot;
  fmt: (iso: string) => string;
  dayLabel: (day: Day) => string;
  onBack: () => void;
}

export function SlotDetail({ slot, fmt, dayLabel, onBack }: Props) {
  return (
    <div className="animate-fadein relative">
      {/* Atmospheric blurred background */}
      {slot.imageUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[65vh] overflow-hidden pointer-events-none z-0"
        >
          <img
            src={slot.imageUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-110 opacity-30"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-sch-bg to-transparent" />
        </div>
      )}

      <button
        onClick={onBack}
        className="relative z-10 flex items-center gap-2 px-5 py-4 font-mono-share text-[0.62rem] tracking-[0.2em] uppercase text-sch-muted hover:text-sch-text transition-colors cursor-pointer bg-transparent"
      >
        <span className="text-[0.8rem]">←</span> Retour
      </button>

      {slot.imageUrl && (
        <div className="relative z-10 w-full aspect-square overflow-hidden">
          <img
            src={slot.imageUrl}
            alt={slot.artistName}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-sch-bg via-sch-bg/60 to-transparent" />
        </div>
      )}

      <div
        className={[
          "relative z-10 px-5 pb-12",
          slot.imageUrl ? "-mt-10" : "pt-6",
        ].join(" ")}
      >
        {slot.note && (
          <p className="font-mono-share text-[0.62rem] tracking-[0.18em] uppercase text-sch-muted mb-3">
            {slot.note}
          </p>
        )}
        <h2 className="font-bebas text-[clamp(3.5rem,16vw,6rem)] leading-[0.88] text-sch-text tracking-[0.01em]">
          {slot.artistName}
        </h2>
        <div className="h-px w-10 bg-acid mt-3 mb-3" />
        <p className="font-mono-share text-[0.68rem] tracking-[0.12em] text-sch-muted uppercase">
          {fmt(slot.startTime)} — {fmt(slot.endTime)}
          {" · "}
          {slot.stage === "MAIN" ? "Main Stage" : "After"}
          {" · "}
          {dayLabel(slot.day)}
        </p>
        {slot.description && (
          <p className="font-barlow font-light text-[1rem] leading-relaxed text-sch-text/80 mt-6 max-w-prose">
            {slot.description}
          </p>
        )}
      </div>
    </div>
  );
}
