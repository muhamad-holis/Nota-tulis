"use client";

import { Settings as SettingsIcon, Menu } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  showSettings?: boolean;
  rightSlot?: ReactNode;
}

export function Header({ title, showSettings = true, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Menu size={20} className="text-slate-400" />
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        {rightSlot}
        {showSettings && (
          <Link
            href="/pengaturan"
            className="rounded-full p-2 text-slate-500 active:bg-slate-100"
            aria-label="Pengaturan"
          >
            <SettingsIcon size={20} />
          </Link>
        )}
      </div>
    </header>
  );
}
