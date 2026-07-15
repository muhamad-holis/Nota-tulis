"use client";

import { useCallback, useMemo, useState } from "react";
import { db, nextNotaNumber } from "@/database/schema";
import type { NotaItem } from "@/types";
import { generateItemId } from "@/lib/utils";
import { enqueueSync } from "@/lib/sync";

function emptyRow(): NotaItem {
  return { id: generateItemId(), name: "", price: 0, qty: 1 };
}

export function useNota() {
  const [items, setItems] = useState<NotaItem[]>([emptyRow()]);
  const [customerName, setCustomerName] = useState("");

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
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

  const reset = useCallback(() => {
    setItems([emptyRow()]);
    setCustomerName("");
  }, []);

  const validItems = useMemo(
    () => items.filter((item) => item.name.trim() !== "" && (item.price > 0 || item.qty > 0)),
    [items]
  );

  const saveNota = useCallback(async () => {
    if (validItems.length === 0) {
      throw new Error("Nota masih kosong.");
    }
    const number = await nextNotaNumber();
    const now = Date.now();
    const uuid = crypto.randomUUID();
    const nota = {
      uuid,
      number,
      customerName: customerName.trim() || undefined,
      date: now,
      items: validItems,
      total: validItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      updatedAt: now,
    };
    const id = await db.notas.add(nota);
    enqueueSync("notas", uuid);
    return { ...nota, id };
  }, [validItems, customerName]);

  return {
    items,
    total,
    customerName,
    setCustomerName,
    updateItem,
    removeItem,
    addRow,
    ensureTrailingRow,
    reset,
    validItems,
    saveNota,
  };
}
