"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
}

export default function SpotlightCard({
  children,
  className,
  onClick,
  glowColor = "rgba(26, 122, 74, 0.3)"
}: SpotlightCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn("relative group cursor-pointer", className)} onClick={onClick}>
      {!prefersReducedMotion && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
        />
      )}
      <div className={cn(
        "relative bg-bg-card rounded-2xl p-6 border border-border shadow-card",
        !prefersReducedMotion && "transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-0.5"
      )}>
        {children}
      </div>
    </div>
  );
}
