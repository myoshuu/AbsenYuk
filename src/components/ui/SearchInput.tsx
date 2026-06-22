"use client";

import { useState, useCallback } from "react";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export default function SearchInput({ placeholder = "Cari...", onSearch, className = "", debounceMs = 300 }: SearchInputProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); debouncedSearch(); }}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-bg-warm rounded-xl border border-border text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40 placeholder:text-ink-soft transition-all"
      />
      {value && (
        <button
          onClick={() => { setValue(""); onSearch(""); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
