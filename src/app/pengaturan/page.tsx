"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreInfoSection } from "@/components/pengaturan/StoreInfoSection";
import { ReceiptTextSection } from "@/components/pengaturan/ReceiptTextSection";
import { PrinterSettingsSection } from "@/components/pengaturan/PrinterSettingsSection";
import { BackupRestoreSection } from "@/components/pengaturan/BackupRestoreSection";
import { AboutSection } from "@/components/pengaturan/AboutSection";
import { SyncSection } from "@/components/pengaturan/SyncSection";
import { DangerZoneSection } from "@/components/pengaturan/DangerZoneSection";
import { useSettings, updateSettings } from "@/hooks/useSettings";
import type { Settings } from "@/types";

export default function PengaturanPage() {
  const settings = useSettings();

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

            <SyncSection />
            <BackupRestoreSection />
            <DangerZoneSection />
            <AboutSection />
          </>
        ) : (
          <div className="py-16 text-center text-sm text-slate-400">Memuat pengaturan...</div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
