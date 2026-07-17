"use client";

import { useEffect, useState } from "react";
import { Search, History as HistoryIcon, Printer, Trash2, Pencil, Save, X as XIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { HistoryItem } from "@/components/riwayat/HistoryItem";
import { ReceiptPreview } from "@/components/cetak/ReceiptPreview";
import { NotaTable } from "@/components/nota/NotaTable";
import { TotalBar } from "@/components/nota/TotalBar";
import { useHistory, deleteNota } from "@/hooks/useHistory";
import { useEditNota } from "@/hooks/useEditNota";
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
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savingEdit, setSavingEdit] = useState(false);

  const {
    items,
    total,
    customerName,
    setCustomerName,
    updateItem,
    removeItem,
    addRow,
    ensureTrailingRow,
    saveChanges,
  } = useEditNota(selected);

  // Setiap kali user buka nota lain dari daftar, selalu mulai dari mode lihat (bukan lanjutan edit sebelumnya).
  useEffect(() => {
    setMode("view");
  }, [selected?.id]);

  function handleEnterName(id: string) {
    document.getElementById(`price-input-${id}`)?.focus();
  }

  function handleEnterQty(id: string, isLast: boolean) {
    if (isLast) {
      ensureTrailingRow();
      setTimeout(() => {
        const rows = document.querySelectorAll<HTMLInputElement>('[id^="name-input-"]');
        rows[rows.length - 1]?.focus();
      }, 30);
    } else {
      const allNameInputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('[id^="name-input-"]')
      );
      const idx = allNameInputs.findIndex((el) => el.id === `name-input-${id}`);
      allNameInputs[idx + 1]?.focus();
    }
  }

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

  async function handleSaveEdit() {
    setSavingEdit(true);
    try {
      const updated = await saveChanges();
      setSelected(updated);
      setMode("view");
      showToast("Perubahan nota disimpan", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan perubahan", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSaveAndReprint() {
    if (!settings) return;
    setSavingEdit(true);
    try {
      const updated = await saveChanges();
      setSelected(updated);
      setMode("view");
      const ok = await print(updated, settings);
      showToast(
        ok ? "Perubahan disimpan & nota dicetak ulang" : "Perubahan disimpan, tapi gagal mencetak",
        ok ? "success" : "error"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan perubahan", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  function handleCloseDialog() {
    setSelected(null);
    setMode("view");
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

      <Dialog
        open={!!selected}
        onClose={handleCloseDialog}
        title={selected ? (mode === "edit" ? `Edit ${selected.number}` : selected.number) : ""}
      >
        {selected && settings && mode === "view" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 py-2">
              <ReceiptPreview nota={selected} settings={settings} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete} className="flex-col gap-1 text-xs">
                <Trash2 size={16} /> Hapus
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMode("edit")} className="flex-col gap-1 text-xs">
                <Pencil size={16} /> Edit / Tambah
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReprint}
                disabled={printing}
                className="flex-col gap-1 text-xs"
              >
                <Printer size={16} /> Cetak Ulang
              </Button>
            </div>
          </div>
        )}

        {selected && settings && mode === "edit" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Ubah qty, harga, atau tambah baris baru kalau pelanggan minta tambahan belanja.
              Nomor nota & tanggal asli tidak berubah.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Nama Pelanggan (opsional)
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Bu Siti"
              />
            </div>
            <NotaTable
              items={items}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddRow={addRow}
              onEnterName={handleEnterName}
              onEnterQty={handleEnterQty}
            />
            <TotalBar total={total} />
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("view")}
                disabled={savingEdit || printing}
                className="flex-col gap-1 text-xs"
              >
                <XIcon size={16} /> Batal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={savingEdit || printing}
                className="flex-col gap-1 text-xs"
              >
                <Save size={16} /> Simpan
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAndReprint}
                disabled={savingEdit || printing}
                className="flex-col gap-1 text-xs"
              >
                <Printer size={16} /> Simpan & Cetak
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
