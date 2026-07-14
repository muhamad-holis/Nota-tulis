"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { Input } from "@/components/ui/Input";
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

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nama Toko</label>
          <Input value={settings.storeName} onChange={(e) => onUpdate({ storeName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Alamat</label>
          <Input value={settings.address} onChange={(e) => onUpdate({ address: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nomor HP</label>
          <Input value={settings.phone} onChange={(e) => onUpdate({ phone: e.target.value })} />
        </div>
      </div>
    </SettingsSection>
  );
}
