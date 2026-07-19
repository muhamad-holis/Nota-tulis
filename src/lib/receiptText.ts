import type { Nota, Settings } from "@/types";
import { formatDateTime, formatRupiah } from "@/lib/utils";

export interface ReceiptLine {
  text: string;
  align: "left" | "center";
  bold?: boolean;
}

export function getCharWidth(settings: Settings): number {
  return settings.paperSize === "80" ? 42 : 32;
}

export function wrapText(text: string, width: number): string[] {
  if (text.length === 0) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width) {
      if (current) lines.push(current);
      if (word.length > width) {
        let remaining = word;
        while (remaining.length > width) {
          lines.push(remaining.slice(0, width));
          remaining = remaining.slice(width);
        }
        current = remaining;
      } else {
        current = word;
      }
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface ColumnWidths {
  nameWidth: number;
  hrgWidth: number;
  qtyWidth: number;
  totalWidth: number;
}

// Minimal supaya nama barang tetap kebaca meski kertas 58mm & angkanya besar.
const MIN_NAME_WIDTH = 8;
// Jarak minimum antar kolom angka, biar tidak nempel satu sama lain.
const COLUMN_GAP = 1;

/**
 * Hitung lebar kolom Barang/Hrg/Qty/Total berdasarkan isi nota ini sendiri
 * (bukan lebar tetap), supaya nama barang, harga, qty, dan total selalu
 * muat dalam SATU baris walau di kertas 58mm (32 karakter).
 *
 * Catatan: lebar kolom Total di sini HANYA dihitung dari total per-baris item,
 * bukan dari grand total nota. Grand total biasanya jauh lebih besar (hasil
 * penjumlahan semua barang) dan kalau ikut dihitung di sini, kolom Total jadi
 * kelebaran untuk semua baris item padahal cuma dipakai penuh di baris TOTAL
 * saja — sisanya jadi ruang kosong nganggur di kanan. Baris TOTAL dirender
 * terpisah (lihat buildReceiptLines) supaya boleh lebih lebar dari kolom ini.
 */
function computeColumnWidths(nota: Nota, charWidth: number): ColumnWidths {
  let maxHrgLen = "Hrg".length;
  let maxQtyLen = "Qty".length;
  let maxTotalLen = "Total".length;

  for (const item of nota.items) {
    const priceStr = formatRupiah(item.price).replace("Rp ", "");
    const qtyStr = `x${item.qty}`;
    const totalStr = formatRupiah(item.totalOverride ?? item.price * item.qty).replace("Rp ", "");
    maxHrgLen = Math.max(maxHrgLen, priceStr.length);
    maxQtyLen = Math.max(maxQtyLen, qtyStr.length);
    maxTotalLen = Math.max(maxTotalLen, totalStr.length);
  }

  let hrgWidth = maxHrgLen + COLUMN_GAP;
  let qtyWidth = maxQtyLen + COLUMN_GAP;
  let totalWidth = maxTotalLen + COLUMN_GAP;
  let nameWidth = charWidth - hrgWidth - qtyWidth - totalWidth;

  // Kolom angka + jarak antar-kolom kebesaran sampai nama kepepet? Lepas dulu jaraknya.
  if (nameWidth < MIN_NAME_WIDTH) {
    hrgWidth = maxHrgLen;
    qtyWidth = maxQtyLen;
    totalWidth = maxTotalLen;
    nameWidth = charWidth - hrgWidth - qtyWidth - totalWidth;
  }

  // Masih kurang juga (kertas sangat sempit / angka sangat besar)? Kolom Total
  // dikorbankan duluan karena paling longgar, baru Harga — sampai nama minimal kebaca.
  while (nameWidth < MIN_NAME_WIDTH && (totalWidth > 4 || hrgWidth > 4)) {
    if (totalWidth > 4) totalWidth -= 1;
    else if (hrgWidth > 4) hrgWidth -= 1;
    nameWidth = charWidth - hrgWidth - qtyWidth - totalWidth;
  }

  nameWidth = Math.max(nameWidth, 4);
  return { nameWidth, hrgWidth, qtyWidth, totalWidth };
}

/** Muat teks rata KIRI ke lebar kolom tertentu (dipakai untuk nama barang). */
function fitLeft(text: string, width: number, truncateMark = false): string {
  if (text.length > width) {
    if (truncateMark && width > 1) return text.slice(0, width - 1) + ".";
    return text.slice(0, width);
  }
  return text.padEnd(width, " ");
}

/** Muat teks rata KANAN ke lebar kolom tertentu (dipakai untuk angka harga/qty/total). */
function fitRight(text: string, width: number): string {
  return text.length >= width ? text : text.padStart(width, " ");
}

/**
 * Bangun representasi nota sebagai daftar baris teks (align + bold),
 * PERSIS sama seperti yang dikirim ke printer thermal.
 * Dipakai bersama oleh printerService (cetak) dan ReceiptPreview (layar)
 * supaya preview tidak pernah beda dari hasil cetak asli.
 */
export function buildReceiptLines(nota: Nota, settings: Settings): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  const charWidth = getCharWidth(settings);
  const divider = "-".repeat(charWidth);
  const push = (text: string, align: "left" | "center" = "left", bold = false) =>
    lines.push({ text, align, bold });

  if (settings.storeName) {
    wrapText(settings.storeName, charWidth).forEach((l) => push(l, "center", true));
  }
  if (settings.address) {
    wrapText(settings.address, charWidth).forEach((l) => push(l, "center"));
  }
  if (settings.phone) {
    wrapText(settings.phone, charWidth).forEach((l) => push(l, "center"));
  }

  push(divider, "center");
  if (settings.headerText) {
    settings.headerText.split("\n").forEach((l) => {
      wrapText(l, charWidth).forEach((wrapped) => push(wrapped, "center"));
    });
    push(divider, "center");
  }

  push(`Tanggal: ${formatDateTime(nota.date)}`, "left");
  push(`No. Nota: ${nota.number}`, "left");
  if (nota.customerName) {
    push(`Pelanggan: ${nota.customerName}`, "left");
  }
  push(divider, "left");

  const { nameWidth, hrgWidth, qtyWidth, totalWidth } = computeColumnWidths(nota, charWidth);

  push(
    fitLeft("Barang", nameWidth) +
      fitRight("Hrg", hrgWidth) +
      fitRight("Qty", qtyWidth) +
      fitRight("Total", totalWidth),
    "left"
  );
  push(divider, "left");

  for (const item of nota.items) {
    const priceStr = formatRupiah(item.price).replace("Rp ", "");
    const qtyStr = `x${item.qty}`;
    const totalStr = formatRupiah(item.totalOverride ?? item.price * item.qty).replace("Rp ", "");
    push(
      fitLeft(item.name, nameWidth, true) +
        fitRight(priceStr, hrgWidth) +
        fitRight(qtyStr, qtyWidth) +
        fitRight(totalStr, totalWidth),
      "left"
    );
  }

  push(divider, "left");

  // Baris TOTAL dirender terpisah dari kolom item: angkanya rata kanan sampai
  // mepet ke tepi kertas, boleh lebih lebar dari kolom Total di baris item
  // (grand total biasanya lebih besar dari total per barang).
  const totalValueStr = formatRupiah(nota.total).replace("Rp ", "");
  const totalLabelWidth = Math.max("TOTAL".length, charWidth - totalValueStr.length);
  push(
    fitLeft("TOTAL", totalLabelWidth) + fitRight(totalValueStr, charWidth - totalLabelWidth),
    "left",
    true
  );
  push(divider, "left");

  if (settings.footerText) {
    settings.footerText.split("\n").forEach((l) => {
      wrapText(l, charWidth).forEach((wrapped) => push(wrapped, "center"));
    });
  }

  return lines;
}
