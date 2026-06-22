"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getLogoutCallbackUrl } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tentang", label: "Tentang" },
  { href: "/fitur", label: "Fitur" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-bg/90 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold">A</div>
          <span className="font-bold text-lg text-ink">AbsenYuk</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm transition-all relative ${
                pathname === link.href
                  ? "text-emerald font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-[1px] left-3 right-3 h-0.5 bg-emerald rounded-full" />
              )}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" className={`px-4 py-2 text-sm transition-colors relative ${
                pathname === "/dashboard" ? "text-emerald font-semibold" : "text-ink-muted hover:text-ink"
              }`}>
                Dashboard
                {pathname === "/dashboard" && (
                  <span className="absolute -bottom-[1px] left-4 right-4 h-0.5 bg-emerald rounded-full" />
                )}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: getLogoutCallbackUrl() })}
                className="px-4 py-2 text-sm text-ink-muted hover:text-error transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors">Masuk</Link>
              <Link href="/register" className="px-5 py-2 bg-emerald text-white rounded-xl text-sm font-medium shadow-button hover:bg-emerald-hover transition-all">Daftar</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-ink-muted hover:text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed top-16 left-0 right-0 bg-bg border-b border-border p-4 flex flex-col gap-2 z-50 shadow-lg"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 text-sm rounded-xl transition-colors ${
                pathname === link.href
                  ? "bg-emerald/10 text-emerald font-medium"
                  : "text-ink-muted hover:bg-bg-warm"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`px-3 py-2.5 text-sm rounded-xl transition-colors ${
                pathname === "/dashboard"
                  ? "bg-emerald/10 text-emerald font-medium"
                  : "text-ink-muted hover:bg-bg-warm"
              }`}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: getLogoutCallbackUrl() })} className="px-3 py-2.5 text-sm rounded-xl text-left text-error hover:bg-error/10 transition-colors">Keluar</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm rounded-xl hover:bg-bg-warm transition-colors">Masuk</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm bg-emerald text-white rounded-xl text-center font-medium">Daftar</Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
}
