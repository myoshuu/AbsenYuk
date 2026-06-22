"use client";

import { motion } from "framer-motion";

interface FilterOption { value: string; label: string; }

interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
            value === opt.value
              ? "bg-accent text-white"
              : "bg-bg-warm text-ink-muted hover:text-ink hover:bg-ink/10"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
