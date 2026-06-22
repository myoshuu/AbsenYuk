"use client";

interface PerformanceBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export default function PerformanceBar({ label, value, max, color = "bg-emerald" }: PerformanceBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-ink w-12 text-right tabular-nums">{pct}%</span>
    </div>
  );
}
