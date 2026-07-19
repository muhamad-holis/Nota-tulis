import { SettingsSection } from "./SettingsSection";

export function AboutSection() {
  return (
    <SettingsSection title="Tentang Aplikasi">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Nota Tulis</span>
        <span className="text-slate-400">Versi 1.0.0</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Aplikasi nota belanja offline. Semua data tersimpan hanya di perangkat ini.
      </p>
    </SettingsSection>
  );
}
