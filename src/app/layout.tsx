import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { SupabaseAuthProvider } from "@/components/layout/SupabaseAuthProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nota Tulis",
  description: "Buat nota belanja secepat mungkin, 100% offline. Untuk warung, toko kelontong, dan UMKM.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nota Tulis",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster />
        <ServiceWorkerRegister />
        <SupabaseAuthProvider />
      </body>
    </html>
  );
}
