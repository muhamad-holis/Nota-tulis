"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { parseProductFile, type ParsedProductRow } from "@/services/csvService";
import { importProducts } from "@/hooks/useProducts";
import { showToast } from "@/lib/toast";
import type { ImportMode } from "@/types";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedProductRow[] | null>(null);
  const [mode, setMode] = useState<ImportMode>("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseProductFile(file);
      if (parsed.length === 0) {
        setError("Tidak ada data produk valid ditemukan di file ini.");
        setRows(null);
      } else {
        setRows(parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca file.");
      setRows(null);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleConfirm() {
    if (!rows) return;
    setLoading(true);
    try {
      await importProducts(rows, mode);
      showToast(`${rows.length} produk berhasil diimport`, "success");
      setRows(null);
      onClose();
    } catch {
      showToast("Gagal mengimport produk", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setRows(null);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Import Produk">
      {!rows ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-8">
            <div className="rounded-full bg-brand-50 p-3 text-brand-500">
              <FileSpreadsheet size={24} />
            </div>
            <p className="text-sm text-slate-500">Import dari CSV atau XLSX</p>
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
              <Upload size={15} /> {loading ? "Memproses..." : "Pilih File"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-600">Contoh Format CSV</p>
            <p>Nama,Harga Jual</p>
            <p>Kopi Kapal Api,15000</p>
            <p>Gula Pasir 1kg,14000</p>
            <p>Sabun Lifebuoy,5000</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ditemukan <span className="font-semibold">{rows.length}</span> produk pada file.
          </p>

          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100">
            {rows.slice(0, 20).map((r, i) => (
              <div key={i} className="flex justify-between px-3 py-1.5 text-sm border-b border-slate-50 last:border-0">
                <span className="truncate text-slate-700">{r.name}</span>
                <span className="text-slate-400">{r.price.toLocaleString("id-ID")}</span>
              </div>
            ))}
            {rows.length > 20 && (
              <p className="px-3 py-1.5 text-xs text-slate-400">
                +{rows.length - 20} produk lainnya
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Metode Import</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("add")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  mode === "add"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Tambah
              </button>
              <button
                onClick={() => setMode("replace")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  mode === "replace"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Replace Semua
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setRows(null)}>
              Kembali
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
              {loading ? "Mengimport..." : "Import Sekarang"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
