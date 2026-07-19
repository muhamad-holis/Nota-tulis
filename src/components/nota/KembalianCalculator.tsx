"use client";

import { Banknote, X } from "lucide-react";
import { formatRupiah, parseRupiahInput, cn } from "@/lib/utils";

interface KembalianCalculatorProps {
  total: number;
  receivedText: string;
  onReceivedTextChange: (text: string) => void;
}

const QUICK_NOMINALS = [10000, 20000, 50000, 100000];

export function KembalianCalculator({ total, receivedText, onReceivedTextChange }: KembalianCalculatorProps) {
  if (total <= 0) return null;

  const received = parseRupiahInput(receivedText);
  const diff = received - total;
  const hasInput = receivedText.trim() !== "";

  function addNominal(value: number) {
    onReceivedTextChange(String(received + value));
  }

  function setExact() {
    onReceivedTextChange(String(total));
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Banknote size={16} className="text-brand-600" />
        <span className="text-sm font-medium text-slate-700">Kalkulator Kembalian</span>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
        <span className="text-sm text-slate-400">Rp</span>
        <input
          inputMode="numeric"
          value={receivedText}
          onChange={(e) => onReceivedTextChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Uang diterima"
          className="flex-1 bg-transparent text-right text-base font-medium text-slate-800 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-400"
        />
        {hasInput && (
          <button
            onClick={() => onReceivedTextChange("")}
            className="text-slate-300 active:text-slate-500"
            aria-label="Kosongkan"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {QUICK_NOMINALS.map((n) => (
          <button
            key={n}
            onClick={() => addNominal(n)}
            className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 active:bg-slate-100"
          >
            +{formatRupiah(n).replace("Rp ", "")}
          </button>
        ))}
        <button
          onClick={setExact}
          className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 active:bg-slate-100"
        >
          Uang Pas
        </button>
      </div>

      {hasInput && (
        <div
          className={cn(
            "mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold",
            diff < 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
          )}
        >
          <span>{diff < 0 ? "Kurang" : "Kembali"}</span>
          <span>{formatRupiah(Math.abs(diff))}</span>
        </div>
      )}
    </div>
  );
}
