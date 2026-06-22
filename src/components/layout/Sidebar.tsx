"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ModeToggle from "@/components/ui/ModeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { getLogoutCallbackUrl } from "@/lib/utils";

const navItems: Record<string, { label: string; href: string; icon: string }[]> = {
  user: [
    { label: "Beranda", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Cari Acara", href: "/dashboard/acara", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { label: "Acara Saya", href: "/dashboard/acara/saya", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ],
  organizer: [
    { label: "Beranda", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Kelola Acara", href: "/dashboard/acara/kelola", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { label: "Log Absensi", href: "/dashboard/absensi", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ],
  admin: [
    { label: "Beranda", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Panel Admin", href: "/dashboard/admin", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { label: "User Manager", href: "/dashboard/admin/users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Acara Manager", href: "/dashboard/admin/acara", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Absensi Manager", href: "/dashboard/admin/absensi", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Export", href: "/dashboard/export", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ],
};

const bottomItems = [
  { label: "Profil", href: "/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function Sidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const role = session?.user?.role || "user";
  const items = navItems[role] || navItems.user;

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="Buka menu navigasi"
              className="fixed top-4 left-4 z-50 bg-sidebar text-white p-3 rounded-xl min-h-11 min-w-11 flex items-center justify-center shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
           <SheetContent side="left" className="w-72 bg-sidebar p-0 text-white">
            <SidebarContent pathname={pathname} role={role} items={items} bottomItems={bottomItems} session={session} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white flex-col">
        <SidebarContent pathname={pathname} role={role} items={items} bottomItems={bottomItems} session={session} />
      </aside>
    </>
  );
}

function SidebarContent({ pathname, role, items, bottomItems, session }: {
  pathname: string;
  role: string;
  items: { label: string; href: string; icon: string }[];
  bottomItems: { label: string; href: string; icon: string }[];
  session: any;
}) {
  return (
    <>
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
          <span className="font-bold text-lg tracking-tight">AbsenYuk</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin" role="navigation" aria-label="Navigasi utama">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 min-h-11 ${
                active
                  ? "bg-white/12 text-white font-medium border border-white/20 shadow-[inset_3px_0_0_rgba(16,185,129,0.6)]"
                  : "text-sidebar-muted hover:text-white hover:bg-white/5 border border-transparent hover:translate-x-0.5"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? "bg-white/15" : "bg-white/8"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <span className="text-[clamp(0.75rem, 2vw, 0.875rem)]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-2 border-t border-white/10">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 min-h-11 ${
                active
                  ? "bg-white/12 text-white font-medium border border-white/20"
                  : "text-sidebar-muted hover:text-white hover:bg-white/5 border border-transparent hover:translate-x-0.5"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? "bg-white/15" : "bg-white/8"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <span className="text-[clamp(0.75rem, 2vw, 0.875rem)]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <span className="text-xs text-sidebar-muted">Tampilan</span>
          <ModeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.[0] || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-sidebar-muted capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: getLogoutCallbackUrl() })}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-xl text-sm text-sidebar-muted hover:text-white hover:bg-white/5 transition-colors min-h-11"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </>
  );
}
