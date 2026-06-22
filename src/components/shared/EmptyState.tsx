"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-24 h-24 text-ink-soft/40 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-ink-muted text-sm max-w-xs">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
