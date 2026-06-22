export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-bg-card rounded-2xl p-6 border border-border ${className}`}>
      <Skeleton className="w-12 h-12 mb-4" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
