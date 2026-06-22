"use client";

import { useState, useRef, useEffect } from "react";

interface Action {
  label: string;
  icon?: "edit" | "trash" | "eye" | "more" | "download" | "copy";
  variant?: "default" | "danger";
  disabled?: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  actions: Action[];
  align?: "left" | "right";
}

const iconPaths: Record<string, string> = {
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  more: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  copy: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
};

export default function ActionMenu({ actions, align = "right" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`p-2 rounded-lg transition-colors ${
          action.variant === "danger"
            ? "text-error hover:bg-error/10"
            : "text-ink-muted hover:text-ink hover:bg-ink/5"
        } ${action.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        title={action.label}
      >
        {action.icon && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[action.icon]} />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors"
        aria-label="Actions"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths.more} />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1 w-44 bg-card rounded-xl shadow-lg border border-border py-1 z-20 animate-scale-in`}
        >
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  setOpen(false);
                }
              }}
              disabled={action.disabled}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                action.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : action.variant === "danger"
                  ? "text-error hover:bg-error/10"
                  : "text-ink hover:bg-ink/5"
              }`}
            >
              {action.icon && (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[action.icon]} />
                </svg>
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
