"use client";

import { db } from "@/database/schema";

export interface BackupPayload {
  version: number;
  exportedAt: number;
  products: unknown[];
  notas: unknown[];
  settings: unknown[];
}

export async function exportBackup(): Promise<void> {
  const [products, notas, settings] = await Promise.all([
    db.products.toArray(),
    db.notas.toArray(),
    db.settings.toArray(),
  ]);

  const payload: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    products,
    notas,
    settings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `nota-tulis-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;

  if (!payload || !Array.isArray(payload.products) || !Array.isArray(payload.notas)) {
    throw new Error("File backup tidak valid.");
  }

  await db.transaction("rw", db.products, db.notas, db.settings, async () => {
    await db.products.clear();
    await db.notas.clear();
    await db.settings.clear();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (payload.products.length) await db.products.bulkAdd(payload.products as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (payload.notas.length) await db.notas.bulkAdd(payload.notas as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (payload.settings.length) await db.settings.bulkAdd(payload.settings as any);
  });
}
