"use client";

import { useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { NotaTable } from "@/components/nota/NotaTable";
import { TotalBar } from "@/components/nota/TotalBar";
import { KembalianCalculator } from "@/components/nota/KembalianCalculator";
import { ActionButtons } from "@/components/nota/ActionButtons";
import { Input } from "@/components/ui/Input";
import { useNota } from "@/hooks/useNota";
import { useSettings } from "@/hooks/useSettings";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { showToast } from "@/lib/toast";

export default function NotaBaruPage() {
  const {
    items,
    total,
    customerName,
    setCustomerName,
    updateItem,
    removeItem,
    addRow,
    ensureTrailingRow,
    reset,
    saveNota,
  } = useNota();
  const settings = useSettings();
  const { print, printing, isSupported } = useBluetoothPrinter();
  const [saving, setSaving] = useState(false);
  const [receivedText, setReceivedText] = useState("");
  const isBusyRef = useRef(false);

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

  async function handleSave() {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setSaving(true);
    try {
      await saveNota();
      showToast("Nota berhasil disimpan", "success");
      reset();
      setReceivedText("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan nota", "error");
    } finally {
      setSaving(false);
      isBusyRef.current = false;
    }
  }

  async function handlePrint() {
    if (!settings) return;
    if (!isSupported) {
      showToast("Bluetooth tidak didukung di perangkat ini", "error");
      return;
    }
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    try {
      const saved = await saveNota();
      const ok = await print(saved, settings);
      if (ok) {
        showToast("Nota berhasil dicetak", "success");
        reset();
        setReceivedText("");
      } else {
        showToast("Gagal mencetak. Cek koneksi printer.", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mencetak nota", "error");
    } finally {
      isBusyRef.current = false;
    }
  }

  function handleNewNota() {
    reset();
    setReceivedText("");
    showToast("Nota baru dibuat", "info");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="Nota Tulis" />

      <main className="flex-1 space-y-4 overflow-y-auto p-4 pb-32">
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
        <KembalianCalculator
          total={total}
          receivedText={receivedText}
          onReceivedTextChange={setReceivedText}
        />
      </main>

      <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-slate-50/95 p-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
        <ActionButtons
          onSave={handleSave}
          onPrint={handlePrint}
          onNewNota={handleNewNota}
          saving={saving || printing}
          printing={printing || saving}
        />
      </div>

      <BottomNav />
    </div>
  );
}
