"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import { Toaster } from "sonner";

const CommandPalette = dynamic(() => import("@/components/admin/CommandPalette"));

export default function DashboardLayout({ children, session }: { children: React.ReactNode; session: any }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const role = session?.user?.role || "user";

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-lg focus:shadow-lg">
        Langsung ke konten utama
      </a>
      <div className="min-h-screen bg-bg">
        <div className="bg-noise" />
        <Sidebar session={session} />
        <main id="main-content" className="relative z-10 lg:ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
        <Toaster position="bottom-center" />
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} role={role} />
    </>
  );
}
