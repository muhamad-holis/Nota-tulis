"use client";

import { SettingsSection } from "./SettingsSection";
import { LiveField } from "@/components/ui/LiveField";
import type { Settings } from "@/types";

interface ReceiptTextSectionProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export function ReceiptTextSection({ settings, onUpdate }: ReceiptTextSectionProps) {
  return (
    <>
      <SettingsSection title="Tulisan Atas Nota">
        <LiveField
          multiline
          rows={2}
          value={settings.headerText}
          onCommit={(v) => onUpdate({ headerText: v })}
          placeholder={"TERIMA KASIH\nSELAMAT DATANG"}
        />
      </SettingsSection>

      <SettingsSection title="Tulisan Bawah Nota">
        <LiveField
          multiline
          rows={2}
          value={settings.footerText}
          onCommit={(v) => onUpdate({ footerText: v })}
          placeholder="Terima kasih atas kepercayaan Anda."
        />
      </SettingsSection>

      <SettingsSection title="Ukuran Kertas">
        <div className="grid grid-cols-2 gap-2">
          {(["58", "80"] as const).map((size) => (
            <button
              key={size}
              onClick={() => onUpdate({ paperSize: size })}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
                settings.paperSize === size
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {size} mm
            </button>
          ))}
        </div>
      </SettingsSection>
    </>
  );
}
