type Stage = "MAIN" | "AFTER";
type Day = "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface Slot {
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
  nowSlot: Slot | null;
  nextSlot: Slot | null;
  fmt: (iso: string) => string;
  onSelectSlot: (slot: Slot) => void;
}

export function NowView({ nowSlot, nextSlot, fmt, onSelectSlot }: Props) {
  if (nowSlot) {
    return (
      <div className="px-5 pt-8 pb-10 animate-fadein">
        {nowSlot.imageUrl && (
          <div className="w-full aspect-video md:aspect-[3/1] overflow-hidden mb-6 relative rounded-sm">
            <img
              src={nowSlot.imageUrl}
              alt={nowSlot.artistName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sch-bg to-transparent" />
          </div>
        )}
        {nowSlot.note && (
          <div className="font-mono-share text-[0.62rem] tracking-[0.18em] uppercase text-sch-muted mb-3">
            {nowSlot.note}
          </div>
        )}
        <h2
          onClick={() => onSelectSlot(nowSlot)}
          className="font-bebas text-[clamp(3rem,14vw,6rem)] leading-[0.88] text-acid tracking-[0.01em] cursor-pointer hover:opacity-80 transition-opacity"
        >
          {nowSlot.artistName}
        </h2>
        <p className="font-mono-share text-[0.7rem] tracking-[0.12em] text-sch-muted uppercase mt-2">
          {fmt(nowSlot.startTime)} — {fmt(nowSlot.endTime)}
          {" · "}
          {nowSlot.stage === "MAIN" ? "Main Stage" : "After"}
        </p>
        {nowSlot.description && (
          <p className="font-barlow font-light text-[1rem] leading-relaxed text-sch-text/80 mt-6 max-w-prose">
            {nowSlot.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 flex flex-col items-center justify-center min-h-[60vh] animate-fadein text-center">
      <div className="flex items-center gap-3 mb-10">
        <span className="block w-12 h-px bg-sch-border" />
        <span className="font-mono-share text-[0.55rem] tracking-[0.35em] text-sch-muted uppercase">
          Pause
        </span>
        <span className="block w-12 h-px bg-sch-border" />
      </div>
      <h2 className="font-bebas text-[clamp(3.5rem,18vw,7rem)] leading-[0.88] text-sch-text/20 tracking-[0.02em] uppercase select-none mb-1">
        Entre
      </h2>
      <h2 className="font-bebas text-[clamp(3.5rem,18vw,7rem)] leading-[0.88] text-sch-text/20 tracking-[0.02em] uppercase select-none">
        Deux Sets
      </h2>
      {nextSlot && (
        <div className="mt-12 border border-sch-border px-6 py-5 max-w-xs w-full text-left">
          <p className="font-mono-share text-[0.55rem] tracking-[0.3em] text-sch-muted uppercase mb-3">
            Prochain set
          </p>
          <p className="font-bebas text-[clamp(1.8rem,8vw,2.6rem)] leading-[0.9] text-sch-text tracking-[0.01em]">
            {nextSlot.artistName}
          </p>
          {nextSlot.note && (
            <p className="font-mono-share text-[0.58rem] tracking-[0.12em] uppercase text-sch-muted mt-1">
              {nextSlot.note}
            </p>
          )}
          <p className="font-mono-share text-[0.62rem] tracking-[0.1em] text-acid mt-3">
            {fmt(nextSlot.startTime)}
            {" · "}
            {nextSlot.stage === "MAIN" ? "Main Stage" : "After"}
          </p>
        </div>
      )}
    </div>
  );
}
