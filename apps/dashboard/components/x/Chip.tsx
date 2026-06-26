/** A small colored pill for action types / tags. */
export function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {label}
    </span>
  );
}
