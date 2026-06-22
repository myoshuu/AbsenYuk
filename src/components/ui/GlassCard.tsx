"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl shadow-lg p-6",
        hover && "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
