import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

/**
 * Auto-detects the correct callback URL for logout.
 * Uses current window origin to handle VS Code port forwarding correctly.
 */
export function getLogoutCallbackUrl(): string {
  // On client-side, always use current origin to handle port forwarding
  if (typeof window !== "undefined") {
    return `${window.location.origin}/`;
  }
  // Fallback for server-side
  return process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/` : "/";
}

/**
 * Gets the origin for absolute URLs (used by NextAuth in some cases)
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}
