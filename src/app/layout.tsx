import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProviderWrapper } from "@/components/ui/theme-provider";

// Force dynamic rendering since pages require authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: "AbsenYuk", template: "%s | AbsenYuk" },
  description: "Platform absensi acara modern dan mudah digunakan",
  openGraph: {
    title: "AbsenYuk",
    description: "Platform absensi acara modern dan mudah digunakan",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProviderWrapper>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
