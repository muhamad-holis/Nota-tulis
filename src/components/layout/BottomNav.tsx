"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Nota", icon: FileText },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.4 : 2}
              className={cn(active ? "text-brand-600" : "text-slate-400")}
            />
            <span className={cn(active ? "font-medium text-brand-600" : "text-slate-400")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
