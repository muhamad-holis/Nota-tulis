"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/schema";

export function useHistory(search = "", dateFrom?: number, dateTo?: number) {
  const notas = useLiveQuery(async () => {
    let all = await db.notas.orderBy("date").reverse().toArray();

    if (dateFrom) all = all.filter((n) => n.date >= dateFrom);
    if (dateTo) all = all.filter((n) => n.date <= dateTo);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      all = all.filter(
        (n) =>
          n.number.toLowerCase().includes(q) ||
          n.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    return all;
  }, [search, dateFrom, dateTo]);

  return notas ?? [];
}

export async function deleteNota(id: number) {
  return db.notas.delete(id);
}
