"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { SettingsSection } from "@/components/pengaturan/SettingsSection";
import { StoreInfoSection } from "@/components/pengaturan/StoreInfoSection";
import { ReceiptTextSection } from "@/components/pengaturan/ReceiptTextSection";
import { PrinterSettingsSection } from "@/components/pengaturan/PrinterSettingsSection";
import { BackupRestoreSection } from "@/components/pengaturan/BackupRestoreSection";
import { AboutSection } from "@/components/pengaturan/AboutSection";
import { ImportDialog } from "@/components/produk/ImportDialog";
import { useSettings, updateSettings } from "@/hooks/useSettings";
import type { Settings } from "@/types";

export default function PengaturanPage() {
  const settings = useSettings();
  const [importOpen, setImportOpen] = useState(false);

  async function handleUpdate(patch: Partial<Settings>) {
    if (!settings?.id) return;
    await updateSettings(settings.id, patch);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="Pengaturan" showSettings={false} />

      <main className="flex-1 space-y-3 overflow-y-auto p-4 pb-24">
        {settings ? (
          <>
            <StoreInfoSection settings={settings} onUpdate={handleUpdate} />
            <ReceiptTextSection settings={settings} onUpdate={handleUpdate} />
            <PrinterSettingsSection settings={settings} onUpdate={handleUpdate} />

            <SettingsSection title="Import Produk">
              <p className="mb-3 text-xs text-slate-400">
                Import daftar produk dari file CSV atau Excel (.xlsx).
              </p>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload size={14} /> Import dari Spreadsheet
              </Button>
            </SettingsSection>

            <BackupRestoreSection />
            <AboutSection />
          </>
        ) : (
          <div className="py-16 text-center text-sm text-slate-400">Memuat pengaturan...</div>
        )}
      </main>

      <BottomNav />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
