"use client";

import { useEffect, useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getCurrentRecoveryCode, restoreWithCode } from "@/lib/auth";
import { pullAll } from "@/lib/sync";
import { showToast } from "@/lib/toast";

export function SyncSection() {
  const [code, setCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getCurrentRecoveryCode().then(setCode);
  }, []);

  async function handleRestore() {
    if (!inputCode.trim()) return;
    setRestoring(true);
    try {
      await restoreWithCode(inputCode);
      await pullAll();
      setCode(await getCurrentRecoveryCode());
      showToast("Data berhasil dipulihkan", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memulihkan data", "error");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <SettingsSection title="Cadangan Cloud">
      <p className="mb-2 text-xs text-slate-400">
        Simpan kode ini baik-baik. Kalau HP hilang atau browser di-clear, masukkan kode ini di HP
        baru untuk memulihkan semua data (produk, nota, pengaturan).
      </p>
      <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2.5 text-center font-mono text-lg tracking-wider text-slate-800">
        {code ?? "Memuat..."}
      </div>

      <p className="mb-1 text-xs font-medium text-slate-500">Pulihkan data dari kode lain</p>
      <div className="flex gap-2">
        <Input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX"
          className="font-mono"
        />
        <Button variant="outline" size="md" onClick={handleRestore} disabled={restoring}>
          {restoring ? "..." : "Pulihkan"}
        </Button>
      </div>
    </SettingsSection>
  );
}
