"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: string;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  label,
  color = "#1a7a4a",
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-ink">{Math.round(animatedValue)}</span>
          {label && <span className="text-[10px] text-ink-muted uppercase tracking-wide">{label}</span>}
        </div>
      )}
    </div>
  );
}
