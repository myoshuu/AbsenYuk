// src/components/public/AnimatedBackground.tsx
"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      <div
        className="absolute -top-40 -right-40 w-96 h-96 bg-emerald/5 rounded-full blur-3xl animate-pulse-soft"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute top-1/3 -left-32 w-72 h-72 bg-warning/5 rounded-full blur-3xl animate-pulse-soft"
        style={{ animationDuration: "10s", animationDelay: "1s" }}
      />
      <div
        className="absolute -bottom-20 right-1/4 w-80 h-80 bg-muted/50 rounded-full blur-3xl animate-pulse-soft"
        style={{ animationDuration: "12s", animationDelay: "2s" }}
      />
    </div>
  );
}
