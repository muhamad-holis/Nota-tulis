"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/database/schema";
import type { Nota, NotaItem } from "@/types";
import { generateItemId } from "@/lib/utils";
import { enqueueSync } from "@/lib/sync";
import { learnProductsFromItems } from "@/hooks/useProducts";

function emptyRow(): NotaItem {
  return { id: generateItemId(), name: "", price: 0, qty: 1 };
}

/**
 * Mengelola draft edit untuk nota yang SUDAH tersimpan di riwayat.
 * Dipakai saat pelanggan minta tambah pesanan setelah nota tercetak:
 * baris-baris item lama tetap ada, tinggal tambah baris baru atau ubah qty,
 * lalu simpan (dan cetak ulang) tanpa membuat nomor nota baru.
 */
export function useEditNota(nota: Nota | null) {
  const [items, setItems] = useState<NotaItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  // Muat ulang draft setiap kali nota yang sedang dibuka berganti (id berubah).
  useEffect(() => {
    if (!nota) return;
    setItems(nota.items.length ? nota.items.map((item) => ({ ...item })) : [emptyRow()]);
    setCustomerName(nota.customerName ?? "");
  }, [nota?.id]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.totalOverride ?? item.price * item.qty), 0),
    [items]
  );

  const updateItem = useCallback((id: string, patch: Partial<NotaItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.length ? filtered : [emptyRow()];
    });
  }, []);

  const addRow = useCallback(() => {
    setItems((prev) => [...prev, emptyRow()]);
  }, []);

  const ensureTrailingRow = useCallback(() => {
    setItems((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.name.trim() === "") return prev;
      return [...prev, emptyRow()];
    });
  }, []);

  const validItems = useMemo(
    () => items.filter((item) => item.name.trim() !== "" && (item.price > 0 || item.qty > 0)),
    [items]
  );

  /** Simpan perubahan ke nota yang sama (nomor & tanggal asli tidak berubah). */
  const saveChanges = useCallback(async (): Promise<Nota> => {
    if (!nota?.id) throw new Error("Nota tidak ditemukan.");
    if (validItems.length === 0) throw new Error("Nota tidak boleh kosong.");

    const patch = {
      customerName: customerName.trim() || undefined,
      items: validItems,
      total: validItems.reduce((sum, item) => sum + (item.totalOverride ?? item.price * item.qty), 0),
      updatedAt: Date.now(),
    };
    await db.notas.update(nota.id, patch);
    if (nota.uuid) enqueueSync("notas", nota.uuid);
    learnProductsFromItems(validItems).catch((err) =>
      console.error("Gagal mempelajari nama/harga barang:", err)
    );
    return { ...nota, ...patch };
  }, [nota, customerName, validItems]);

  return {
    items,
    total,
    customerName,
    setCustomerName,
    updateItem,
    removeItem,
    addRow,
    ensureTrailingRow,
    validItems,
    saveChanges,
  };
}
