"use client";

import { ChevronRight } from "lucide-react";
import { formatDateTime, formatRupiah } from "@/lib/utils";
import type { Nota } from "@/types";

interface HistoryItemProps {
  nota: Nota;
  onClick: () => void;
}

export function HistoryItem({ nota, onClick }: HistoryItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left active:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="font-medium text-slate-800">{nota.number}</p>
        <p className="text-sm text-slate-400">{formatDateTime(nota.date)}</p>
        <p className="text-xs text-slate-400">{nota.items.length} item</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-brand-700">{formatRupiah(nota.total)}</span>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </button>
  );
}
