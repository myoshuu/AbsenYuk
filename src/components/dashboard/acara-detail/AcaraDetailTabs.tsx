"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface Props {
  isOwner: boolean;
}

const tabs = [
  { key: "info", label: "Informasi", href: "" },
  { key: "chat", label: "Chat", href: "/chat" },
  { key: "files", label: "File", href: "/files" },
];

export default function AcaraDetailTabs({ isOwner }: Props) {
  const pathname = usePathname();
  const { id } = useParams();

  const allTabs = isOwner
    ? [...tabs, { key: "absensi", label: "Absensi", href: "/absensi" }]
    : tabs;

  const basePath = `/dashboard/acara/${id}`;

  const isActive = (href: string) => {
    if (!href) return pathname === basePath;
    return pathname === `${basePath}${href}`;
  };

  return (
    <div className="relative flex gap-1 bg-card/50 rounded-xl p-1 border border-border overflow-x-auto">
      {allTabs.map((t) => (
        <Link
          key={t.key}
          href={`${basePath}${t.href}`}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
            isActive(t.href)
              ? "bg-emerald text-white shadow-md"
              : "text-ink-muted hover:text-ink hover:bg-ink/5"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
