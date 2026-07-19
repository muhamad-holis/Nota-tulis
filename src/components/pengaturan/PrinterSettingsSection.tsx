"use client";

import { Bluetooth, CheckCircle2, Printer } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { Button } from "@/components/ui/Button";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { showToast } from "@/lib/toast";
import type { Settings } from "@/types";

interface PrinterSettingsSectionProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export function PrinterSettingsSection({ settings, onUpdate }: PrinterSettingsSectionProps) {
  const { connect, testPrint, connecting, printing, isSupported, status } = useBluetoothPrinter();

  async function handleConnect() {
    if (!isSupported) {
      showToast("Web Bluetooth tidak didukung di browser ini", "error");
      return;
    }
    const info = await connect();
    if (info) {
      onUpdate({ printer: info });
      showToast(`Terhubung ke ${info.name}`, "success");
    }
  }

  async function handleTestPrint() {
    const ok = await testPrint(settings);
    showToast(ok ? "Test print berhasil" : "Test print gagal", ok ? "success" : "error");
  }

  const statusLabel: Record<typeof status, string> = {
    connected: "Terhubung",
    reconnecting: "Menyambungkan ulang...",
    connecting: "Mencari...",
    disconnected: settings.printer ? "Terputus" : "Belum terhubung",
  };
  const statusIsGood = status === "connected";

  return (
    <SettingsSection title="Printer Bluetooth">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Bluetooth size={18} className={statusIsGood ? "text-brand-600" : "text-slate-400"} />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {settings.printer?.name ?? "Belum terhubung"}
            </p>
            <p
              className={`flex items-center gap-1 text-xs ${
                statusIsGood
                  ? "text-emerald-600"
                  : status === "reconnecting" || status === "connecting"
                    ? "text-amber-600"
                    : "text-slate-400"
              }`}
            >
              {statusIsGood && <CheckCircle2 size={12} />}
              {statusLabel[status]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleConnect} disabled={connecting}>
          <Bluetooth size={14} /> {connecting ? "Mencari..." : statusIsGood ? "Ganti Printer" : "Cari Printer"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleTestPrint}
          disabled={printing || !settings.printer}
        >
          <Printer size={14} /> Test Print
        </Button>
      </div>
      {!isSupported && (
        <p className="mt-2 text-xs text-slate-400">
          Perangkat/browser ini belum mendukung Web Bluetooth. Gunakan Chrome di Android.
        </p>
      )}
    </SettingsSection>
  );
}
