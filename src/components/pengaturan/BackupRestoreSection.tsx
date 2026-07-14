"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { Button } from "@/components/ui/Button";
import { exportBackup, importBackup } from "@/services/backupService";
import { showToast } from "@/lib/toast";

export function BackupRestoreSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportBackup();
      showToast("Backup berhasil diunduh", "success");
    } catch {
      showToast("Gagal membuat backup", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await importBackup(file);
      showToast("Data berhasil dipulihkan. Memuat ulang...", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memulihkan backup", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <SettingsSection title="Backup Database">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleExport} disabled={busy}>
          <Download size={14} /> Export JSON
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload size={14} /> Import JSON
        </Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Import JSON akan mengganti seluruh data produk, nota, dan pengaturan saat ini.
      </p>
    </SettingsSection>
  );
}
