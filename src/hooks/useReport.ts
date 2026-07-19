"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/schema";

export type ReportPeriod = "today" | "week" | "month";

export interface TopItem {
  name: string;
  qty: number;
  total: number;
}

export interface ReportData {
  omzet: number;
  jumlahNota: number;
  rataRataPerNota: number;
  topItems: TopItem[];
}

function getStartTimestamp(period: ReportPeriod): number {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  if (period === "week") {
    const day = now.getDay(); // 0 = Minggu, 1 = Senin, ...
    const offsetToMonday = day === 0 ? 6 : day - 1;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetToMonday).getTime();
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * Rekap omzet & barang terlaris dari nota yang sudah tersimpan, murni hasil olahan
 * dari data yang sudah ada (tidak perlu input tambahan apa pun dari pengguna).
 */
export function useReport(period: ReportPeriod): ReportData | undefined {
  return useLiveQuery(async () => {
    const start = getStartTimestamp(period);
    const notas = await db.notas.where("date").aboveOrEqual(start).toArray();

    const omzet = notas.reduce((sum, n) => sum + n.total, 0);
    const jumlahNota = notas.length;
    const rataRataPerNota = jumlahNota > 0 ? omzet / jumlahNota : 0;

    // Gabungkan barang dengan nama sama (tanpa peduli besar-kecil huruf / spasi di ujung)
    // supaya "Kopi mix" dan "kopi mix " terhitung sebagai barang yang sama.
    const itemMap = new Map<string, TopItem>();
    for (const nota of notas) {
      for (const item of nota.items) {
        const key = item.name.trim().toLowerCase();
        if (!key) continue;
        const itemTotal = item.totalOverride ?? item.price * item.qty;
        const existing = itemMap.get(key);
        if (existing) {
          existing.qty += item.qty;
          existing.total += itemTotal;
        } else {
          itemMap.set(key, { name: item.name.trim(), qty: item.qty, total: itemTotal });
        }
      }
    }

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { omzet, jumlahNota, rataRataPerNota, topItems };
  }, [period]);
}
