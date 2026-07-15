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

export function padColumns(cols: string[], widths: number[]): string {
  return cols
    .map((col, i) => {
      const w = widths[i];
      if (col.length >= w) return col.slice(0, w);
      return col.padEnd(w, " ");
    })
    .join("");
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

  const hrgWidth = 7;
  const qtyWidth = 5;
  const totalWidth = 10;
  const nameWidth = charWidth - hrgWidth - qtyWidth - totalWidth;

  push(padColumns(["Barang", "Hrg", "Qty", "Total"], [nameWidth, hrgWidth, qtyWidth, totalWidth]), "left");
  push(divider, "left");

  for (const item of nota.items) {
    wrapText(item.name, charWidth).forEach((l) => push(l, "left"));
    const priceStr = formatRupiah(item.price).replace("Rp ", "");
    const totalStr = formatRupiah(item.totalOverride ?? item.price * item.qty).replace("Rp ", "");
    push(
      padColumns(["", priceStr, `x${item.qty}`, totalStr], [nameWidth, hrgWidth, qtyWidth, totalWidth]),
      "left"
    );
  }

  push(divider, "left");
  const totalValueStr = formatRupiah(nota.total).replace("Rp ", "");
  push(
    padColumns(["TOTAL", "", "", totalValueStr], [nameWidth, hrgWidth, qtyWidth, totalWidth]),
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
