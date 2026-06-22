"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  category: string;
  href?: string;
  action?: () => void;
  icon: string;
  shortcut?: string;
  minRole?: "user" | "organizer" | "admin";
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  role?: string;
}

export default function CommandPalette({ open, onClose, role = "user" }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands with role requirements
  const allCommands: Command[] = [
    // User commands
    { id: "home", label: "Beranda", category: "Navigasi", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "search-events", label: "Cari Acara", category: "Navigasi", href: "/dashboard/acara", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { id: "my-events", label: "Acara Saya", category: "Navigasi", href: "/dashboard/acara/saya", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "profile", label: "Profil Saya", category: "Navigasi", href: "/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    // Organizer commands
    { id: "manage-events", label: "Kelola Acara", category: "Organizer", href: "/dashboard/acara/kelola", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", minRole: "organizer" },
    { id: "attendance-log", label: "Log Absensi", category: "Organizer", href: "/dashboard/absensi", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", minRole: "organizer" },
    { id: "export", label: "Export Data", category: "Organizer", href: "/dashboard/export", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", minRole: "organizer" },
    // Admin commands
    { id: "admin-panel", label: "Panel Admin", category: "Admin", href: "/dashboard/admin", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", minRole: "admin" },
    { id: "users", label: "Kelola User", category: "Admin", href: "/dashboard/admin/users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", minRole: "admin" },
    { id: "events-admin", label: "Kelola Acara", category: "Admin", href: "/dashboard/admin/acara", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", minRole: "admin" },
    { id: "attendance-admin", label: "Log Absensi", category: "Admin", href: "/dashboard/admin/absensi", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", minRole: "admin" },
    // Actions (available to all)
    { id: "refresh", label: "Refresh Halaman", category: "Aksi", action: () => window.location.reload(), icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", shortcut: "R" },
  ];

  // Role hierarchy for comparison
  const roleHierarchy: Record<string, number> = {
    user: 1,
    organizer: 2,
    admin: 3,
  };
  const currentRoleLevel = roleHierarchy[role] || 1;

  // Filter commands by role
  const commands = allCommands.filter((cmd) => {
    if (!cmd.minRole) return true; // Available to all
    return currentRoleLevel >= roleHierarchy[cmd.minRole];
  });

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const executeCommand = useCallback(
    (command: Command) => {
      if (command.href) {
        router.push(command.href);
      } else if (command.action) {
        command.action();
      }
      onClose();
      setQuery("");
      setSelectedIndex(0);
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          setQuery("");
          setSelectedIndex(0);
          break;
      }
    },
    [open, filteredCommands, selectedIndex, executeCommand, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-lg bg-bg-card rounded-2xl border border-border shadow-xl overflow-hidden animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-5 h-5 text-ink-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik untuk mencari..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-ink placeholder:text-ink-muted outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-ink/10 rounded text-xs text-ink-muted font-mono">
            esc
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              Tidak ada perintah yang ditemukan
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-ink-muted uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        isSelected
                          ? "bg-accent/10 text-accent"
                          : "text-ink hover:bg-ink/5"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-accent/20" : "bg-ink/10"
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cmd.icon} />
                        </svg>
                      </div>
                      <span className="flex-1 text-left font-medium">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 bg-ink/10 rounded text-xs text-ink-muted font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-ink/10 rounded font-mono">↑↓</kbd>
              navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-ink/10 rounded font-mono">↵</kbd>
              pilih
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-ink/10 rounded font-mono">⌘K</kbd>
            untuk membuka
          </span>
        </div>
      </div>
    </div>
  );
}
