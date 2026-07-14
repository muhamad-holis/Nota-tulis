"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/schema";
import type { Product } from "@/types";
import type { ParsedProductRow } from "@/services/csvService";

export function useProducts(search = "") {
  const products = useLiveQuery(async () => {
    const all = await db.products.orderBy("name").toArray();
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q));
  }, [search]);

  return products ?? [];
}

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

export async function addProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const now = Date.now();
  return db.products.add({ ...data, createdAt: now, updatedAt: now });
}

export async function updateProduct(id: number, data: Partial<Product>) {
  return db.products.update(id, { ...data, updatedAt: Date.now() });
}

export async function deleteProduct(id: number) {
  return db.products.delete(id);
}

export async function importProducts(rows: ParsedProductRow[], mode: "add" | "replace") {
  const now = Date.now();
  await db.transaction("rw", db.products, async () => {
    if (mode === "replace") {
      await db.products.clear();
    }
    await db.products.bulkAdd(
      rows.map((r) => ({
        name: r.name,
        price: r.price,
        category: r.category,
        createdAt: now,
        updatedAt: now,
      }))
    );
  });
}
