"use client";

import { useState } from "react";
import { Search, History as HistoryIcon, Printer, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { HistoryItem } from "@/components/riwayat/HistoryItem";
import { ReceiptPreview } from "@/components/cetak/ReceiptPreview";
import { useHistory, deleteNota } from "@/hooks/useHistory";
import { useSettings } from "@/hooks/useSettings";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { showToast } from "@/lib/toast";
import type { Nota } from "@/types";

function startOfDay(dateStr: string): number | undefined {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T00:00:00`).getTime();
}

function endOfDay(dateStr: string): number | undefined {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T23:59:59`).getTime();
}

export default function RiwayatPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const notas = useHistory(search, startOfDay(dateFrom), endOfDay(dateTo));
  const settings = useSettings();
  const { print, printing } = useBluetoothPrinter();
  const [selected, setSelected] = useState<Nota | null>(null);

  async function handleReprint() {
    if (!selected || !settings) return;
    const ok = await print(selected, settings);
    showToast(ok ? "Nota berhasil dicetak ulang" : "Gagal mencetak nota", ok ? "success" : "error");
  }

  async function handleDelete() {
    if (!selected?.id) return;
    await deleteNota(selected.id);
    showToast("Nota dihapus dari riwayat", "info");
    setSelected(null);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="Riwayat" />

      <div className="space-y-2 p-4 pb-2">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor nota atau barang..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          {notas.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="Belum ada riwayat nota"
              description="Nota yang disimpan akan muncul di sini."
            />
          ) : (
            notas.map((nota) => (
              <HistoryItem key={nota.id} nota={nota} onClick={() => setSelected(nota)} />
            ))
          )}
        </div>
      </main>

      <BottomNav />

      <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.number ?? ""}>
        {selected && settings && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 py-2">
              <ReceiptPreview nota={selected} settings={settings} />
            </div>
            <div className="flex gap-2">
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                <Trash2 size={16} /> Hapus
              </Button>
              <Button className="flex-1" onClick={handleReprint} disabled={printing}>
                <Printer size={16} /> Cetak Ulang
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
