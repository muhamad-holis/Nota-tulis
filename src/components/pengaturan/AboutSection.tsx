import { SettingsSection } from "./SettingsSection";

export function AboutSection() {
  return (
    <SettingsSection title="Tentang Aplikasi">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Nota Tulis</span>
        <span className="text-slate-400">Versi 1.0.0</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Aplikasi pencatatan nota toko retail yang ringkas, sederhana, mudah digunakan, cepat,
        dan efisien. Semua data berjalan dan tersimpan langsung menggunakan data HP
        masing-masing, tanpa perlu koneksi internet.
      </p>
      <div className="mt-3 border-t border-slate-100 pt-3 text-center text-xs text-slate-300">
        © {new Date().getFullYear()} Dibuat oleh Muhamad Holis
      </div>
    </SettingsSection>
  );
}
