"use client";

import { useState } from "react";
import { TrendingUp, Receipt, Wallet, PackageSearch } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReport, type ReportPeriod } from "@/hooks/useReport";
import { formatRupiah, cn } from "@/lib/utils";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
];

export default function LaporanPage() {
  const [period, setPeriod] = useState<ReportPeriod>("today");
  const report = useReport(period);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="Laporan" />

      <main className="flex-1 space-y-4 overflow-y-auto p-4 pb-24">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                period === p.value ? "bg-white text-brand-600 shadow-soft" : "text-slate-500"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {!report ? (
          <div className="py-16 text-center text-sm text-slate-400">Memuat laporan...</div>
        ) : report.jumlahNota === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada nota"
            description="Laporan akan muncul otomatis setelah ada nota yang disimpan pada periode ini."
          />
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp size={16} className="text-brand-600" />
                <span className="text-sm font-medium">Omzet</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                {formatRupiah(report.omzet)}
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Receipt size={16} className="text-brand-600" />
                  <span className="text-xs font-medium">Jumlah Nota</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-slate-800">{report.jumlahNota}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Wallet size={16} className="text-brand-600" />
                  <span className="text-xs font-medium">Rata-rata/Nota</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {formatRupiah(report.rataRataPerNota)}
                </p>
              </Card>
            </div>

            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <PackageSearch size={16} className="text-brand-600" />
                <span className="text-sm font-medium">Barang Terlaris</span>
              </div>
              {report.topItems.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada barang tercatat.</p>
              ) : (
                <div className="space-y-3">
                  {report.topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.qty} terjual</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-slate-600">
                        {formatRupiah(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
