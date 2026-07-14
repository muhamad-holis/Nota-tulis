# Nota Tulis

PWA pembuat nota belanja untuk warung, toko kelontong, toko sembako, UMKM, dan penjual rumahan.
100% offline — tanpa login, tanpa cloud, semua data tersimpan di IndexedDB perangkat.

## Menjalankan di Termux / lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Build production

```bash
npm run build
npm run start
```

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Import repo di [vercel.com](https://vercel.com/new).
3. Vercel otomatis mendeteksi Next.js — langsung deploy tanpa konfigurasi tambahan.

## Install sebagai aplikasi (PWA)

- **Android (Chrome):** buka situs → menu (⋮) → "Tambahkan ke layar Utama" / "Install aplikasi".
- **Desktop (Chrome/Edge):** klik ikon install (⊕) di address bar.

## Fitur Utama

- Input nota cepat dengan autocomplete produk & navigasi Enter antar kolom
- Swipe kiri pada baris nota untuk menghapus item
- Perhitungan total realtime per baris & total keseluruhan
- Manajemen produk: tambah, edit, hapus, cari, import dari CSV/XLSX
- Cetak struk via printer Bluetooth thermal (ESC/POS, 58mm & 80mm)
- Riwayat nota dengan pencarian dan filter tanggal, serta cetak ulang
- Pengaturan toko: nama, alamat, HP, logo (crop otomatis), teks atas/bawah nota
- Backup & restore seluruh data dalam format JSON
- Installable PWA dengan dukungan offline penuh (service worker)

## Catatan Printer Bluetooth

Fitur cetak menggunakan Web Bluetooth API, yang saat ini hanya didukung oleh
Chrome/Edge di Android dan desktop (belum didukung Safari/iOS). Pastikan
printer thermal sudah dalam mode pairing sebelum menekan "Cari Printer".

## Struktur Folder

```
src/
  app/            Halaman (App Router): Nota Baru, Produk, Riwayat, Pengaturan
  components/     Komponen UI per fitur (nota, produk, pengaturan, riwayat, cetak, ui, layout)
  hooks/          React hooks (produk, nota, settings, riwayat, printer bluetooth)
  lib/            Utilitas (format rupiah, tanggal, gambar, toast, cn)
  services/       Layanan (printer ESC/POS, import CSV/XLSX, backup JSON)
  database/       Skema IndexedDB (Dexie)
  types/          Tipe TypeScript bersama
public/
  manifest.json   Manifest PWA
  sw.js           Service worker (offline caching)
  icons/          Ikon aplikasi (termasuk maskable icon)
```
