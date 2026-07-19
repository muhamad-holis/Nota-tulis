"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { Switch } from "@/components/ui/Switch";
import { LiveField } from "@/components/ui/LiveField";
import { cropImageToSquareDataUrl } from "@/lib/image";
import { showToast } from "@/lib/toast";
import type { Settings } from "@/types";

interface StoreInfoSectionProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export function StoreInfoSection({ settings, onUpdate }: StoreInfoSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await cropImageToSquareDataUrl(file);
      onUpdate({ logo: dataUrl });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mengupload logo", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <SettingsSection title="Informasi Toko">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50"
        >
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo} alt="Logo toko" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-slate-400" />
          )}
        </button>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm font-medium text-brand-600"
            disabled={uploading}
          >
            {uploading ? "Mengunggah..." : "Ubah Logo Toko"}
          </button>
          <p className="text-xs text-slate-400">Logo otomatis dipotong persegi</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
      </div>

      {settings.logo && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-slate-700">Tampilkan Logo di Struk</p>
            <p className="text-xs text-slate-400">
              Matikan kalau printer tidak butuh logo (lebih cepat &amp; hemat kertas)
            </p>
          </div>
          <Switch
            checked={settings.showLogo !== false}
            onChange={(checked) => onUpdate({ showLogo: checked })}
            label="Tampilkan logo di struk"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nama Toko</label>
          <LiveField value={settings.storeName} onCommit={(v) => onUpdate({ storeName: v })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Alamat</label>
          <LiveField value={settings.address} onCommit={(v) => onUpdate({ address: v })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nomor HP</label>
          <LiveField value={settings.phone} onCommit={(v) => onUpdate({ phone: v })} />
        </div>
      </div>
    </SettingsSection>
  );
}
