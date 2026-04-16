export type Statut = "PENDING" | "VALIDATED" | "DENIED";

const BADGE_COLORS: Record<Statut, string> = {
  VALIDATED: "text-green-700 bg-green-100",
  DENIED: "text-red-700 bg-red-100",
  PENDING: "text-yellow-700 bg-yellow-100",
};

export function StatutBadge({ statut }: { statut: Statut }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_COLORS[statut]}`}
    >
      {statut}
    </span>
  );
}
