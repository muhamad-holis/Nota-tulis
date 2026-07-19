"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/schema";
import { enqueueSync } from "@/lib/sync";
import type { NotaItem } from "@/types";

export function useProductSuggestions(query: string, limit = 5) {
  const suggestions = useLiveQuery(async () => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await db.products.toArray();
    return all
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);
  }, [query, limit]);

  return suggestions ?? [];
}

/**
 * "Belajar" nama & harga barang dari nota yang baru disimpan/diedit, supaya lain kali
 * mengetik nama yang sama, harganya otomatis tersaran (autocomplete) — jadi tidak perlu
 * ketik ulang dari nol dan menghindari typo harga. Tidak ada halaman kelola produk manual;
 * daftar ini murni terbentuk sendiri dari kebiasaan nulis nota sehari-hari.
 *
 * Dipanggil sebagai fire-and-forget (tidak di-await) di pemanggilnya, supaya proses
 * belajar di latar belakang ini tidak pernah bikin simpan/cetak nota jadi lambat atau gagal.
 */
export async function learnProductsFromItems(items: NotaItem[]): Promise<void> {
  const now = Date.now();
  for (const item of items) {
    const name = item.name.trim();
    if (!name || !(item.price > 0)) continue;

    const nameLower = name.toLowerCase();
    const existing = await db.products.filter((p) => p.name.trim().toLowerCase() === nameLower).first();

    if (existing) {
      // Harga sama seperti terakhir kali → tidak perlu nulis ulang ke DB / antre sync.
      if (existing.price === item.price) continue;
      await db.products.update(existing.id!, { price: item.price, updatedAt: now });
      if (existing.uuid) enqueueSync("products", existing.uuid);
    } else {
      const uuid = crypto.randomUUID();
      await db.products.add({ name, price: item.price, createdAt: now, updatedAt: now, uuid });
      enqueueSync("products", uuid);
    }
  }
}
