import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return "Rp 0";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

export function parseRupiahInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

/**
 * Parse input qty yang boleh desimal, untuk pembelian setengah/seperempat
 * satuan (mis. setengah kg telur). Menerima koma ATAU titik sebagai
 * pemisah desimal (mis. "0,5" atau "0.5"), dan dibulatkan ke 2 desimal
 * supaya tidak muncul angka aneh akibat floating point (0.1 + 0.2 dst).
 */
export function parseQtyInput(value: string): number {
  const cleaned = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

/**
 * Tampilkan qty dengan format Indonesia (koma sebagai desimal), dan buang
 * ".00"/trailing zero yang tidak perlu. Dipakai di preview, cetak, & laporan
 * supaya "0.5" selalu tampil sebagai "0,5", bukan simbol pecahan (½ dsb)
 * karena printer thermal belum tentu mendukung karakter itu.
 */
export function formatQty(qty: number): string {
  if (!Number.isFinite(qty)) return "0";
  const rounded = Math.round(qty * 100) / 100;
  const text = rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return text.replace(".", ",");
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
