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
    <div className="animate-fadein">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-4 font-mono-share text-[0.62rem] tracking-[0.2em] uppercase text-sch-muted hover:text-sch-text transition-colors cursor-pointer bg-transparent"
      >
        <span className="text-[0.8rem]">←</span> Retour
      </button>

      {slot.imageUrl && (
        <div className="w-full aspect-video overflow-hidden relative">
          <img
            src={slot.imageUrl}
            alt={slot.artistName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-sch-bg to-transparent" />
        </div>
      )}

      <div className="px-5 pt-6 pb-12">
        {slot.note && (
          <p className="font-mono-share text-[0.62rem] tracking-[0.18em] uppercase text-sch-muted mb-3">
            {slot.note}
          </p>
        )}
        <h2 className="font-bebas text-[clamp(3rem,14vw,5.5rem)] leading-[0.88] text-sch-text tracking-[0.01em]">
          {slot.artistName}
        </h2>
        <p className="font-mono-share text-[0.68rem] tracking-[0.12em] text-sch-muted uppercase mt-3">
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
