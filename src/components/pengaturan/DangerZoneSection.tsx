"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { clearAllNotas } from "@/hooks/useHistory";
import { showToast } from "@/lib/toast";

export function DangerZoneSection() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await clearAllNotas();
      showToast("Semua riwayat nota berhasil dihapus", "success");
      setOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus riwayat", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SettingsSection title="Zona Berbahaya">
        <p className="mb-3 text-xs text-slate-400">
          Hapus semua riwayat transaksi nota (lokal & cloud) agar database kembali kosong. Data
          produk dan pengaturan toko tidak ikut terhapus.
        </p>
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          <Trash2 size={14} /> Hapus Semua Riwayat Nota
        </Button>
      </SettingsSection>

      <Dialog open={open} onClose={() => setOpen(false)} title="Hapus semua riwayat nota?">
        <p className="mb-4 text-sm text-slate-600">
          Semua nota belanja yang tersimpan (lokal & di cloud) akan dihapus permanen dan{" "}
          <span className="font-semibold">tidak bisa dikembalikan</span>. Produk dan pengaturan
          toko tidak akan terpengaruh.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="flex-1" onClick={() => setOpen(false)} disabled={busy}>
            Batal
          </Button>
          <Button variant="danger" size="md" className="flex-1" onClick={handleConfirm} disabled={busy}>
            {busy ? "Menghapus..." : "Ya, Hapus Semua"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
